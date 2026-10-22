# Flappy Parrots

A bilingual pixel-style browser game with bird unlocks, three difficulty levels, local score saving, sound effects, responsive controls, fair hitboxes, and a day/sunset/night cycle.

The background cycle repeats day → sunset → night every 20 points. Optional bonus items are enabled from Settings by default: a seven-second shield, risk stars worth three points, a temporary glide feather, and a wind boost that slows pipes.

`sprites.js` is the single source of truth for sprite-sheet crop locations. Update it if you replace any sheet with a different layout.

## Bird unlock order

Cockatiel, Blue Budgie, Canary, Java Sparrow, Green Budgie, Rose Lovebird, Bourke's Parakeet, Amazon Parrot, Blue-and-yellow Macaw, Scarlet Macaw, White Cockatoo, then Toco Toucan.

## Run it

Open this folder with a local web server (for example, VS Code Live Server) and open `index.html`.

## Optional assets

The included sheets are loaded from `images/` and are used directly by the game:

- `backgrounds_sheet.png`
- `birds_select_sheet.png`
- `birds_fly_sheet.png`
- `pipes_sheet.png`
- `ui_sheet.png`
- `effects_sheet.png`
- `logo.png`

Sound files can be placed under `sounds/` as `flap.mp3`, `point.mp3`, `hit.mp3`, `die.mp3`, `button.mp3`, and `unlock.mp3`.
