"use strict";

const DomParser = require('dom-parser');
const fs = require("fs");
const parser = new DomParser();

// Iterate the element's children
const il = (n) => {
    let txt = "";
    for (let i = 0; i < n.childNodes.length; i++) {
        txt += convertElement(n.childNodes[i]);
    }
    return txt;
};

const getClasses = (node) => {
    let classes = [];
    if (node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
            if (node.attributes[i].name === "class") {
                classes = node.attributes[i].value.toLowerCase().split(" ");
            }
        }
    }
    return classes;
};

const getTitleAttr = (node) => {
    let title = "";
    if (node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
            if (node.attributes[i].name === "title") {
                title = node.attributes[i].value;
            }
        }
    }
    return title;
};

const fixDropcaps = (classes) => {
    let arr = [];
    for (let i = 0; i < classes.length; i++) {
        
        if (classes[i].startsWith("findent")) {
            arr.push(`findent=${classes[i].replace("findent", "").replace("x", ".").replace("n", "-")}pt`);
        }
        else if (classes[i].startsWith("lraise")) {
            arr.push(`lraise=${classes[i].replace("lraise", "").replace("x", ".").replace("n", "-")}`);
        }
        else if (classes[i].startsWith("lhang")) {
            arr.push(`lhang=${classes[i].replace("lhang", "").replace("x", ".").replace("n", "-")}`);
        }
    }
    if (arr.length == 0) {
        return "";
    }
    return `[${arr.join(",")}]`;
};

const fixWidowOrphan = (classes, widow = true) => {
    let tag = "lnw-";   // Look for widow tag
    if (!widow) {
        tag = "lno-";   // Look for orphan tag
    }
    for (let i = 0; i < classes.length; i++) {
        if (classes[i].startsWith(tag)) {
            return classes[i].replace(tag, "");
        }
    }
    return "";
};

const fixOrphans = (classes) => {

};

const classConverter = (classes, title = "", isNote = false) => {
    let pre = "";
    let post = "";
    for (let i = 0; i < classes.length; i++) {
        switch (classes[i]) {
            case "spacebefore":
            case "space-before":
            case "distance":
                pre += "\\spacebefore{";
                post += "}";
                break;
            case "spaceafter":
            case "space-after":
                pre += "\\spaceafter{";
                post += "}";
                break;
            case "longquote":
            case "long-quote":
                pre += "\\longquote{";
                post += "}";
                break;
            case "somequote": // TODO: Find out what this does 
                pre += "\\somequote";
                if (classes.include("bigsingle")) {
                    pre += "single";
                }
                pre += "{";
                post += "}";
                break;
            case "bigquote":
                pre += "\\bigquotebefore";
                if (classes.include("bigsingle")) {
                    pre += "single";
                }
                pre += "{";
                if (!classes.include("keepopen")) {
                    post += "}";
                }
                break;
            case "endquote":
                pre += "\\bigquoteafter";
                if (classes.include("bigsingle")) {
                    pre += "single";
                }
                pre += "{";
                if (!classes.include("keepopen")) {
                    post += "}";
                }
                break;
            case "poetry":
                if (!isNote) {
                    pre += "\\poetry{";
                    post += "}";
                }
                break;
            case "noindent":
            case "latex-noindent":
                pre += "\\noindent{}";
                break;
            case "latex-nowidow":
                post += `\n\\nowidow{${fixWidowOrphan(classes, true)}}`;
                break;
            case "latex-noorphan":
                post += `\n\\noclub{${fixWidowOrphan(classes, false)}}`;
                break;
            case "latex-hyphen-penalty": // TODO: Warning, this must be the last class
                pre = "{\\hyphenpenalty=5000\n" + pre;
                post += "\n\\par}";
                break;
            case "latex-no-hyphen":
                pre += "\\mbox{";
                post += "}";
                break;
            case "closetag":
                post += "}";
            case "mainmatter":
                pre += "\n\\mainmatter\n\n";
                break;
            case "backmatter":
                pre += "\n\\backmatter\n\n";
                break;
            case "latex-makeindex":
                pre += "\n\\printindex\n\n";
                break;
            case "frontmatter":
                pre += `\n\\frontmatter\n\n
                \\setcounter{page}{3}\n\n
                \\tableofcontents\\thispagestyle{empty}\n\n
                \\addtocontents{toc}{\\protect\\thispagestyle{empty}}\n
                \\addtocontents{toc}{\\protect\\pagestyle{empty}}\n\n`;
                break;
            case "maketitle":       //TODO: Fix legacy css
            case "latex-maketitle":
                pre += "\n\\maketitle\n\n";
                break;
            case "dropcap":
            case "dropcaps":
                pre += `\\lettrine${fixDropcaps(classes)}{`;
                post += "}";
                break;
            case "initial-words":
                pre += "{";
                post += "}";
                break;
            case "latex-bold":
                pre += "\\textbf{";
                post += "}";
                break;
            case "latex-skip":
                pre += "\\begin{comment}";
                post += "\\end{comment}";
                break;
            case "latex-pagebreak":
                pre += "\n\\pagebreak\n";
                break;
            case "latex-newpage":
                pre += "\n\\newpage\n";
                break;
            case "latex-clearpage":
                pre += "\n\\clearpage\n\n";
                break;
            case "endnotes":
                pre += "\n\\theendnotes\n\n";
                break;
            case "latex-break":
                pre += "\\\\";
                break;
            case "latex-break-toc":
                pre += "\\newline{}";
                break;
            case "latex-newgeometrybegin":
                pre += "\\lbgeometrybegin";
                break;
            case "latex-mapgeometrybegin":
                pre += "\\lbmapgeometrybegin";
                break;
            case "latex-newgeometryend":
                pre += "\\lbgeometryend";
                break;
            case "lb-index-ref":
                pre += `\\index{${title}}`;
                break;
            case "smallcaps":
                pre += "\\textsc{";
                post += "}";
                break;
            case "latex-lineup":
                pre += "\n\\enlargethispage{\\baselineskip}";
                break;
            case "latex-linedown":
                pre += "\n\\enlargethispage{-\\baselineskip}";
                break;
            case "latex-lineupalt":
                pre += "\n\\oldenlargethispage{\\baselineskip}";
                break;
            case "latex-linedownalt":
                pre += "\n\\oldenlargethispage{-\\baselineskip}";
                break;
            default:
                console.log(classes[i]);
                break;
        }
    }
    return [pre, post];
};

const convertElement = (node) => {
    let txt = "";

    let classes = getClasses(node);
    let title = getTitleAttr(node);
    let [pre, post] = classConverter(classes, title);
    // Here starts really complicated logic and several regular expressions
    // TODO: really complicated logic and several regular expressions
    switch (node.nodeName.toLowerCase()) {
        case "p":
            if (classes.includes("nobreak")) {
                post += " ";
            }
            else {
                post += "\n\n";
            }
            txt += `${pre}${il(node)}${post}`;
            break;
        case "span":
        case "ruby":
        case "caption":
        case "td":
            txt += `${pre}${il(node)}${post}`;
            break;
        case "i":
        case "em":
            txt += `\\emph{${il(node)}}`;
            break;
        case "b":
        case "strong":
            txt += `\\textbf{${il(node)}}`;
        case "#text":
            txt += latexEscape(node.textContent);
            break;
        case "div":
            // TODO: div logic
            if (!classes.includes("latex-skip")) {
                txt += il(node);
            }
            break;
        default:
            console.log(node.nodeName);
            break;
    }
    pre = null;
    post = null;
    classes = null;
    return txt;
};

// Escapes illegal characters in latex
const latexEscape = (str) => {
    str = str.replace("\\", "\\textbackslash{}");
    str = str.replace("\\_", "\\_");
    str = str.replace("$", "\\$");
    str = str.replace("%", "\\%");
    str = str.replace("&", "\\&");
    str = str.replace("#", "\\#");

    str = str.replace("\u2013", "--");
    str = str.replace("\u2019", "'");
    str = str.replace("\xad", "\\-");
    str = str.replace("\u2060", "\\-");
    str = str.replace("\u200d", "\\-");
    str = str.replace("\u200b", "{\\hspace{0pt}}");

    str = str.replace("\uffe0", "\\textcent\\");

    return str;
}

class LatexConverter {
    constructor() {
        
    }

    convertPage(xhtml, done) {
        let latex = "";
        fs.readFile(xhtml, "utf8", (err, html) => {
            
            if (!err){
                let dom = parser.parseFromString(html);
                for (let i = 0; i < dom.getElementsByTagName("body")[0].childNodes.length; i++) {
                    let element = dom.getElementsByTagName("body")[0].childNodes[i];

                    // Skip some elements, pre-cleaning
                    if (element.nodeName === "#text" && element.childNodes == undefined && element.textContent.trim() == "") {
                        // Avoid empty text bits in the body
                        continue;
                    }
                    latex += convertElement(element);
                    
                }
                done(latex)
            }
            else {
                done("% ERROR");
            }
            
          });
    }

}

module.exports = LatexConverter;