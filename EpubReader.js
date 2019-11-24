const StreamZip = require("node-stream-zip");
const DomParser = require('dom-parser');
const parser = new DomParser();


class EpubReader {
    constructor(file) {
        this._file = file;
        this._order = new Array()
    }

    _file = null;
    _order = null;

    set file(file) {
        this._file = file;
    }

    getOrder(onError = (e) => {}) {
        const zip = new StreamZip({
            file: this._file,
            storeEntries: true
        });
        
        zip.on('error', err => { 
            onError(err);
         });

         const getAttr = (node, attr) => {
            let title = "";
            if (node.attributes.length > 0) {
                for (let i = 0; i < node.attributes.length; i++) {
                    if (node.attributes[i].name === attr) {
                        title = node.attributes[i].value;
                    }
                }
            }
            return title;
        };

        const getContent = (node) => {
            for (let i = 0; i < node.childNodes.length; i++) {
                let n = node.childNodes[i];
                if (n.nodeName === "content") {
                    return getAttr(n, "src")
                }
            }
            return "";
        };
         
         zip.on('ready', () => {
            //console.log('Entries read: ' + zip.entriesCount);
            for (const entry of Object.values(zip.entries())) {
                const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`;
                if (entry.name.endsWith("ncx")) {
                    const data = zip.entryDataSync(entry.name);
                    let dom = parser.parseFromString(data.toString('utf8'));
                    let els = dom.getElementsByTagName("navPoint");
                    for (let i = 0; i < els.length; i++) {
                        let element = els[i];
                        let playOrder = parseInt(getAttr(element, "playOrder"));
                        let src = getContent(element);
                        this._order[playOrder] = src;
                    }
                }
            }
            // Do not forget to close the file once you're done
            zip.close()
        });
    }

    readXhtml = (f, onError = (e) => {}) => {
        this.getOrder(onError);
        const zip = new StreamZip({
            file: this._file,
            storeEntries: true
        });
        
        zip.on('error', err => { 
            onError(err);
         });
         
         zip.on('ready', () => {
            for (let i = 0; i < this._order.length; i++) {
                if (this._order[i]) {
                    let filename = `OEBPS/${this._order[i]}`;
                    console.log(filename);
                    const data = zip.entryDataSync(filename);
                    // TODO: figure out the function structure and what to pass
                    f(filename, data.toString('utf8'));
                }                
            }
            // Do not forget to close the file once you're done
            zip.close()
        });
    }
}
module.exports = EpubReader;