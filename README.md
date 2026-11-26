# Higher & Higher

A mobile-first endless vertical jumper. The Canal Lounge demo uses a fictional venue name.

Run `python3 -m http.server 8000` from the repository root and open `http://localhost:8000`. GitHub Pages serves the same static entry point.

- Drag anywhere on the playfield or use Arrow keys / A D to steer. The runner jumps automatically.
- Glitch Cookie reveals temporary bonus stars. Green Cloud launches the runner through a smoke trail. Espresso Shot rewards three marked landings.
- You can share a score link or save a PNG score card from the results screen.

The demo venue name is set in `game.js`. It appears on the start screen, the in-game lounge sign and the score card.

## Artwork

`manifest.json` maps original PNG sprites to dimensions and source crops. Keep the originals in `source-sheets/`. The original alpha was reconstructed from a baked checkerboard, so inspect pale edges and internal holes when making new crops. The game loads the composed WebP scenery and the illustrated lounge pickups directly.
