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

class EpubPage {

    _id;
    _filename;
    _buffer;

    constructor() {
        this._id = 0;
        this._filename = "";
        this._buffer = null;
    }

    get id() {
        return this._id;
    }

    set id(v) {
        this._id = v;
    }

    get order() {
        return this._id;
    }

    set order(v) {
        this._id = v;
    }

    get filename() {
        return this._filename;
    }

    set filename(v) {
        this._filename = v;
    }

    get content() {
        return this._buffer.toString('utf8');
    }

    set buffer(v) {
        if (Buffer.isBuffer(v)) {
            this._buffer = v;
        }
        else {
            throw `EpubPage.buffer must be of type Buffer, ${typeof(v)} passed`;
        }
    }

};

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

    readXhtml = (f, onError = (e) => {}) => {
        const zip = new StreamZip({
            file: this._file,
            storeEntries: true
        });
        
        zip.on('error', err => { 
            onError(err);
        });
        
        zip.on('ready', () => {
            try {
                let order = new Array();
                // First let's get the file order
                for (const entry of Object.values(zip.entries())) {
                    if (entry.name.endsWith("ncx")) {
                        const data = zip.entryDataSync(entry.name);
                        let dom = parser.parseFromString(data.toString('utf8'));
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
                        let filename = `OEBPS/${order[i]}`;
                        let page = new EpubPage();
                        page.order = i;
                        page.filename = order[i];
                        page.buffer = zip.entryDataSync(filename);
                        f(page);
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
}
module.exports = EpubReader;