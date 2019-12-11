"use strict";

const StreamZip = require("node-stream-zip");
const DomParser = require('dom-parser');
const Utilities = require("./Epub2LatexUtils");
const parser = new DomParser();

const getContent = (node) => {
    for (let i = 0; i < node.childNodes.length; i++) {
        let n = node.childNodes[i];
        if (n.nodeName === "content") {
            return Utilities.getAttribute(n, "src");
        }
    }
    return "";
};

function readEpubChapters(file) {
    const zip = new StreamZip({
        file: file,
        storeEntries: true
    });
    
    zip.on("error", (err) => { 
        throw err;
    });
    zip.on("ready", () => {
        try {
            let order = [];
            // First let's get the file order
            for (const entry of Object.values(zip.entries())) {
                if (entry.name.endsWith("ncx")) {
                    const data = zip.entryDataSync(entry.name);
                    let dom = parser.parseFromString(data.toString("utf8"));
                    let els = dom.getElementsByTagName("navPoint");
                    for (let i = 0; i < els.length; i++) {
                        let element = els[i];
                        let playOrder = parseInt(Utilities.getAttribute(element, "playOrder"));
                        playOrder--;
                        let src = getContent(element);
                        order[playOrder] = src;
                    }
                }
            }
            
            // Then let's read the files in order
            for (let i = 0; i < order.length; i++) {
                if (order[i]) {
                    zip.entryDataSync(`OEBPS/${order[i]}`); // TODO: return value or call callback (.toString("utf8");)
                }                
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            zip.close()
        }
    });
}
module.exports = readEpubChapters;