// index.js exists only to test the files for now

const Latex = require("./LatexConverter");
const EpubReader = require("./EpubReader");
const conv = new Latex();

let xhtm = "capitolo_01.xhtml";
//conv.convertPage(xhtm, (latex) => {});


//er.getOrder();
EpubReader("Bower_wc.epub")
/*for (let p of EpubReader("Bower_wc.epub")) {
    let latexPage = conv.convertPage(p.toString('utf8'));
    console.log(latexPage);
}*/