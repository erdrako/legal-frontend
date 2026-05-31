# LexMapa UX Audit

Generated: 2026-05-31T13:08:51.590Z

Target: legal-frontend

Status: PASS

Score: 100/100

## Checks

| Result | Severity | Area | Check | Evidence |
|---|---|---|---|---|
| PASS | critical | Information architecture | home-six-sections | Home is organized into hero, debate, recent, topics, norms and how-to-read sections. |
| PASS | critical | Discovery | simple-language-search | Home exposes a natural-language search form for the MVP question. |
| PASS | critical | Discovery | no-quick-access-chips | Home does not render quick-access chips below the search box. |
| PASS | critical | Discovery | query-aware-result-focus | Search results can explain why a proposal matched, support shareable query URLs and highlight relevant diffs. |
| PASS | major | Information architecture | recent-empty-state | Recent changes has an explicit empty state instead of invented data. |
| PASS | critical | Comprehension | summary-before-legal-text | The screen gives a plain summary before the article-by-article diff. |
| PASS | major | Information architecture | important-norms-secondary | Important norms is visually marked as reference, not the main product flow. |
| PASS | critical | Impact | affected-topics-and-groups | The UI separates affected topics from impacted groups. |
| PASS | critical | Comparison | side-by-side-diff | Each change has current and proposed text in separate blocks. |
| PASS | critical | Comprehension | plain-explanation-per-change | Every diff renders what changes and what it means. |
| PASS | critical | Trust | source-status-scope | Source, data status, scope and legal warning are rendered. |
| PASS | major | Trust | stable-legal-dates | Legal update dates are formatted without local timezone day drift. |
| PASS | critical | Trust | diff-original-sources | Each diff renders sources for current and proposed versions. |
| PASS | critical | Trust | pending-source-visible | Missing original links are explicit and visible. |
| PASS | critical | Trust | no-personalized-legal-advice | The interface warns that it is not personalized legal advice. |
| PASS | major | Accessibility | accessibility-basics | The static page has language, landmarks, hidden labels and one H1. |
| PASS | major | Comprehension | brief-how-to-read | How-to-read section is brief and uses the four expected concepts. |
| PASS | major | Responsive | responsive-layout | CSS defines responsive breakpoints and collapses the diff layout. |
| PASS | major | Visual | stable-readable-type | Typography avoids negative letter spacing and viewport-scaled font sizes. |
| PASS | minor | Reliability | no-external-runtime-assets | The static shell does not depend on third-party runtime assets. |

## Follow-up

- Run `npm run audit:ux` after significant frontend changes.
- Run `npm run audit:ux:check` in CI or before deploy.
- Treat this as a product heuristic audit, not a replacement for user testing.
