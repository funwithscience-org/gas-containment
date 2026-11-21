# Does Gas Need a Container?

Interactive gas containment lab for [funwithscience.net](https://funwithscience.net/gas-containment/).

A response to the flat-earth claim that the atmosphere needs a dome because "gas always expands to fill a vacuum".
Four tabs, one particle engine, real units throughout:

1. **The two-bulb demo** – bromine into a vacuum, with the push of gas pressure set against what gravity can hold, and a live second-law ledger.
2. **A sealed tank** – gravity acts inside containers too; stretch the tank from 50 cm to 100 km and watch the load on the lid fall away.
3. **Heavy gas, open top** – why SF₆ or CO₂ sits in an open tank: the atmosphere pushes back at the rim.
4. **A column of air, and a dome** – walls are irrelevant, the top is open, and what a dome with or without gravity would predict against the measured atmosphere.

Everything is in `index.html`: no build step and no dependencies beyond web fonts. The physics engine at the top of the
script is DOM-free and can be run under Node for testing.
