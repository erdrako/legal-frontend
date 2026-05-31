param(
  [string]$BaseUrl = "",
  [int]$Port = 4183,
  [string]$ChromePath = "",
  [switch]$SkipServer
)

$ErrorActionPreference = "Stop"

$AuditRoot = $PSScriptRoot
$ProjectRoot = Split-Path -Parent $AuditRoot
$ScreenshotsDir = Join-Path $AuditRoot "ux-audit-screenshots"
$AuditOutput = Join-Path $AuditRoot "ux-audit"
$SummaryPath = Join-Path $AuditRoot "ux-audit-summary.md"

New-Item -ItemType Directory -Force -Path $ScreenshotsDir | Out-Null

function Find-Chrome {
  param([string]$ExplicitPath)

  if ($ExplicitPath -and (Test-Path $ExplicitPath)) {
    return $ExplicitPath
  }

  $candidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  throw "Chrome or Edge executable not found. Pass -ChromePath or install a supported browser."
}

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$Attempts = 30
  )

  for ($i = 1; $i -le $Attempts; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  throw "Timed out waiting for $Url"
}

function Capture-Screenshot {
  param(
    [string]$Browser,
    [string]$Url,
    [string]$Output,
    [string]$Size
  )

  if (Test-Path $Output) {
    Remove-Item -LiteralPath $Output -Force
  }

  $args = @(
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--disable-background-networking",
    "--virtual-time-budget=3500",
    "--window-size=$Size",
    "--screenshot=$Output",
    $Url
  )

  & $Browser @args | Out-Null

  if (-not (Test-Path $Output)) {
    throw "Screenshot was not created: $Output"
  }
}

$serverProcess = $null

try {
  Push-Location $ProjectRoot

  if (-not $BaseUrl) {
    $BaseUrl = "http://localhost:$Port"

    if (-not $SkipServer) {
      $serverCommand = "`$env:PORT='$Port'; Set-Location '$ProjectRoot'; node scripts/serve-static.mjs"
      $serverProcess = Start-Process -FilePath "powershell" -ArgumentList @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        $serverCommand
      ) -WindowStyle Hidden -PassThru
    }
  }

  Wait-ForHttp -Url $BaseUrl

  & node scripts/audit-ux.mjs "--output=$AuditOutput"

  $browser = Find-Chrome -ExplicitPath $ChromePath

  Capture-Screenshot `
    -Browser $browser `
    -Url $BaseUrl `
    -Output (Join-Path $ScreenshotsDir "home-desktop.png") `
    -Size "1440,1100"

  Capture-Screenshot `
    -Browser $browser `
    -Url $BaseUrl `
    -Output (Join-Path $ScreenshotsDir "home-mobile.png") `
    -Size "390,1000"

  Capture-Screenshot `
    -Browser $browser `
    -Url "$BaseUrl/#diffs" `
    -Output (Join-Path $ScreenshotsDir "diff-desktop.png") `
    -Size "1440,1100"

  $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
  $summary = @"
# UX Audit Summary

Generated: $now

Target: $BaseUrl

Browser: $browser

## Outputs

- UX audit markdown: UX audit/ux-audit.md
- UX audit JSON: UX audit/ux-audit.json
- Screenshots folder: UX audit/ux-audit-screenshots

## Screenshots

- ux-audit-screenshots/home-desktop.png
- ux-audit-screenshots/home-mobile.png
- ux-audit-screenshots/diff-desktop.png
"@

  Set-Content -LiteralPath $SummaryPath -Value $summary -Encoding UTF8

  Write-Host "UX audit completed."
  Write-Host "Report: $AuditOutput.md"
  Write-Host "Screenshots: $ScreenshotsDir"
} finally {
  Pop-Location

  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force
  }
}
