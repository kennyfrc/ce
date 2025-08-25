"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Jspreadsheet = /** @class */ (function (_super) {
    __extends(Jspreadsheet, _super);
    function Jspreadsheet() {
        return _super.call(this) || this;
    }
    Jspreadsheet.prototype.init = function (o) {
        // Shadow root
        var shadowRoot = this.attachShadow({ mode: 'open' });
        // Style
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = 'https://cdn.jsdelivr.net/npm/jspreadsheet-ce/dist/jspreadsheet.min.css';
        shadowRoot.appendChild(css);
        var cssJsuites = document.createElement('link');
        cssJsuites.rel = 'stylesheet';
        cssJsuites.type = 'text/css';
        cssJsuites.href = 'https://cdn.jsdelivr.net/npm/jsuites/dist/jsuites.min.css';
        shadowRoot.appendChild(cssJsuites);
        var cssMaterial = document.createElement('link');
        cssMaterial.rel = 'stylesheet';
        cssMaterial.type = 'text/css';
        cssMaterial.href = 'https://fonts.googleapis.com/css?family=Material+Icons';
        shadowRoot.appendChild(cssMaterial);
        // JSS container
        var container = document.createElement('div');
        shadowRoot.appendChild(container);
        // Properties
        var toolbar = this.getAttribute('toolbar') == "true" ? true : false;
        // Create jexcel element
        this.el = jspreadsheet(container, {
            tabs: true,
            toolbar: toolbar,
            root: shadowRoot,
            worksheets: [{
                    filters: true,
                    minDimensions: [6, 6],
                }],
        });
    };
    Jspreadsheet.prototype.connectedCallback = function () {
        this.init(this);
    };
    Jspreadsheet.prototype.disconnectedCallback = function () {
    };
    Jspreadsheet.prototype.attributeChangedCallback = function () {
    };
    return Jspreadsheet;
}(HTMLElement));
window.customElements.define('j-spreadsheet-ce', Jspreadsheet);
//# sourceMappingURL=webcomponent.js.map