import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve("dist");
const apiBaseUrl = process.env.LEXMAPA_API_BASE_URL ?? "https://lexmapa-api.linqorait.com";

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}

mkdirSync(outDir, { recursive: true });
cpSync(resolve("index.html"), resolve(outDir, "index.html"));
cpSync(resolve("src"), resolve(outDir, "src"), { recursive: true });
writeFileSync(
  resolve(outDir, "config.js"),
  `window.LEXMAPA_CONFIG = ${JSON.stringify({ apiBaseUrl }, null, 2)};\n`
);

console.log(`Pages build written to ${outDir}`);
console.log(`Runtime API: ${apiBaseUrl}`);
