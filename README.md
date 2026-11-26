# Higher & Higher — Asset pack

Copy assets/ into the game repository. manifest.json maps each sprite to its PNG path, size, source crop and trim offset. Animation frames are numbered from 00. Hero frames preserve their crop canvas; align by foot position in engine. Platforms and other items are individually cropped. Source sheets are included for manual adjustments.

Transparency was reconstructed from a baked checkerboard using boundary-connected color removal; soft glows, internal holes and pale details may require manual cleanup. Some environment crops are grouped props, not seamless backgrounds. No game code is included.
