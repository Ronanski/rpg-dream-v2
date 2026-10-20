# PROJECT_RULES.md

## Authorization

- Walang merge sa `main`, walang release, walang workflow run nang walang explicit na authorization ng owner sa parehong message.
- Feature work ay nasa branch (`ccr-*` o `feature/*`), may PR para sa review.
- Hindi binabago ang ibang repository.

## Engineering

- Preserve existing working functionality. Kapag may binago sa engine, patakbuhin ang `npm test` at ilakip ang screenshot evidence.
- Huwag i-claim na tested kung hindi pinatakbo. Isulat kung ano ang na-check at hindi na-check.
- Map/NPC changes ay data lang (`src/world.js`). Engine changes ay sa `src/game.js`.
- Panatilihing zero runtime dependencies; dapat tumakbo ang laro mula sa `file://`.

## Art

- Style target: anime JRPG, clean lines, vibrant colors, 3/4 top-down (tingnan `docs/ASSET_GUIDE.md`).
- Bawat bagong art asset ay dapat may transparent background (characters) o eksaktong dimensions (map) na nakasulat sa `assets/README.md`.

## Documentation

- `HANDOFF.md` ay ina-update sa dulo ng bawat session: what changed, what was checked, what was not, remaining issues, next action.
