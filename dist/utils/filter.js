import jSuites from "jsuites";
import { updateResult } from "./internal.js";
import { refreshSelection } from "./selection.js";
/**
 * Open the column filter
 */
export var openFilter = function (columnId) {
    var obj = this;
    if (!obj.options.filters) {
        console.log('Jspreadsheet: filters not enabled.');
    }
    else {
        // Make sure is integer
        columnId = parseInt(columnId);
        // Reset selection
        obj.resetSelection();
        // Load options
        var optionsFiltered = [];
        if (obj.options.columns[columnId].type == 'checkbox') {
            optionsFiltered.push({ id: 'true', name: 'True' });
            optionsFiltered.push({ id: 'false', name: 'False' });
        }
        else {
            var options = [];
            var hasBlanks = false;
            for (var j = 0; j < obj.options.data.length; j++) {
                var k = obj.options.data[j][columnId];
                var v = obj.records[j][columnId].element.innerHTML;
                if (k && v) {
                    options[k] = v;
                }
                else {
                    hasBlanks = true;
                }
            }
            var keys = Object.keys(options);
            optionsFiltered = [];
            for (var j = 0; j < keys.length; j++) {
                optionsFiltered.push({ id: keys[j], name: options[keys[j]] });
            }
            // Has blank options
            if (hasBlanks) {
                optionsFiltered.push({ value: '', id: '', name: '(Blanks)' });
            }
        }
        // Create dropdown
        var div = document.createElement('div');
        obj.filter.children[columnId + 1].innerHTML = '';
        obj.filter.children[columnId + 1].appendChild(div);
        obj.filter.children[columnId + 1].style.paddingLeft = '0px';
        obj.filter.children[columnId + 1].style.paddingRight = '0px';
        obj.filter.children[columnId + 1].style.overflow = 'initial';
        var opt = {
            data: optionsFiltered,
            multiple: true,
            autocomplete: true,
            opened: true,
            value: obj.filters[columnId] !== undefined ? obj.filters[columnId] : null,
            width: '100%',
            position: (obj.options.tableOverflow == true || obj.parent.config.fullscreen == true) ? true : false,
            onclose: function (o) {
                resetFilters.call(obj);
                obj.filters[columnId] = o.dropdown.getValue(true);
                obj.filter.children[columnId + 1].innerHTML = o.dropdown.getText();
                obj.filter.children[columnId + 1].style.paddingLeft = '';
                obj.filter.children[columnId + 1].style.paddingRight = '';
                obj.filter.children[columnId + 1].style.overflow = '';
                closeFilter.call(obj, columnId);
                refreshSelection.call(obj);
            }
        };
        // Dynamic dropdown
        jSuites.dropdown(div, opt);
    }
};
export var closeFilter = function (columnId) {
    var obj = this;
    if (!columnId) {
        for (var i = 0; i < obj.filter.children.length; i++) {
            if (obj.filters[i]) {
                columnId = i;
            }
        }
    }
    // Search filter
    var search = function (query, x, y) {
        for (var i = 0; i < query.length; i++) {
            var value = '' + obj.options.data[y][x];
            var label = '' + obj.records[y][x].element.innerHTML;
            if (query[i] == value || query[i] == label) {
                return true;
            }
        }
        return false;
    };
    var query = obj.filters[columnId];
    obj.results = [];
    for (var j = 0; j < obj.options.data.length; j++) {
        if (search(query, columnId, j)) {
            obj.results.push(j);
        }
    }
    if (!obj.results.length) {
        obj.results = null;
    }
    updateResult.call(obj);
};
export var resetFilters = function () {
    var obj = this;
    if (obj.options.filters) {
        for (var i = 0; i < obj.filter.children.length; i++) {
            obj.filter.children[i].innerHTML = '&nbsp;';
            obj.filters[i] = null;
        }
    }
    obj.results = null;
    updateResult.call(obj);
};
//# sourceMappingURL=filter.js.map