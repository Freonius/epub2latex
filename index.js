// index.js exists only to test the files for now

const Latex = require("./LatexConverter");
const EpubReader = require("./EpubReader");
const conv = new Latex();

let xhtm = "capitolo_01.xhtml";
//conv.convertPage(xhtm, (latex) => {});

let er = new EpubReader("Bower_wc.epub");
//er.getOrder();
er.readXhtml(null);