window.ms = require('./lib/milgraphics');

import "./map.js";
import MilUnit from "./MilUnit";

let units = [new MilUnit()];
document.getElementById('sidebar').innerHTML = units[0].getSym();
