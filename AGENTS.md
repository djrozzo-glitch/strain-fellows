# Higher & Higher

Continue development of the existing mobile-first browser arcade game. Use vanilla JavaScript, HTML5 Canvas, CSS and the existing illustrated asset pack. GitHub Pages serves the game directly.

## Art and world

- Use electric blue, graphite, deep violet and white. Keep the hooded street runner's LED visor, technical clothing and futuristic sneakers visually distinct from Astro Bot.
- Use the original illustrated assets. Inspect source sheets, crop boundaries and alpha against dark and light backgrounds when editing the pack. Preserve the original sheets and keep mobile download and decode costs low.
- Progress through The Lounge, Dutch Streets, Rooftops, Cloud City, Deep Space and Another Dimension. Blend zones gradually and use depth-dependent parallax.
- Anchor buildings to continuous façades, the ground or the skyline. Reserve floating islands for fantasy zones, keep cloud edges clean and preserve contrast around the runner, platforms and pickups.
- Keep the interface compact and English-only.

## Gameplay

- Preserve endless auto-jumping, touch dragging across the field, Arrow and A/D controls, and horizontal wrapping.
- Preserve normal, moving, breakable and boost platforms, plus coins, stars, springs and rockets. Maintain progressive difficulty.
- Keep local personal best, quick restart and score sharing working. The global leaderboard is a later milestone.
- Keep sprite drawing dimensions independent of collision geometry.

## Development

- Inspect the existing code and assets before editing. Implement changes in the repository and preserve working behavior.
- Avoid unnecessary dependencies. Prevent accidental page scrolling and text selection during mobile play.
- Validate gameplay and asset loading in a browser at mobile and desktop sizes before committing. For scenery changes, capture and inspect each zone and check its transitions.
- Update cache-busting URLs when served code or styles change. Use versioned URLs or filenames for revised assets. Keep the changelog concise.
- Commit completed, tested changes with descriptive messages. Push to GitHub only when authorized.
