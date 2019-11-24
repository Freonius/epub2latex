"use strict";

class LatexOptions {
    public constructor(options = null) {
        if (!options) {
            return;
        }

        if(typeof(options.title) !== "undefined") {
            this._title = options.title;
        }
        else {
            this._title = "Title";
        }

        if(typeof(options.subtitle) !== "undefined") {
            this._subtitle = options.subtitle;
        }
        else {
            this._subtitle = "";
        }
    }

    // Private variables
    private _title: string;

    private _subtitle: string;

    // Getters and setters
    get title(): string {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
    }

    get subtitle(): string {
        return this._subtitle;
    }

    set subtitle(subtitle: string) {
        this._subtitle = subtitle;
    }

    // Return the complete LaTeX header
    public getLatexTop(): string {
        let latex = "";
        // TODO
        return latex;
    }
}

//module.exports = LatexOptions;