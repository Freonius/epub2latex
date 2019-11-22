// index.js exists only to test the files for now

const Latex = require("./LatexConverter");
const conv = new Latex();

let xhtm = "capitolo_01.xhtml";
conv.convertPage(xhtm);