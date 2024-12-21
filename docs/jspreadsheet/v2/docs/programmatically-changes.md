title: Programmatical Changes
keywords: Jspreadsheet CE, Jexcel, JavaScript Data Grid, Spreadsheets, JavaScript tables, Excel-like data grid, web-based spreadsheets, data grid controls, data grid features
description: Create data grids with spreadsheet controls with Jexcel.

[Back to Documentation](/jspreadsheet/v2/docs)

# Programmatically changes available in the plugin

Using Jspreadsheet will have a comprehensive range of native commands to interact with the users of your javascript spreadsheet.

## General Methods

| Description| Example|
| ---|---|
| **getData: get the full or partial table data in json** <br>@Param boolan onlyHighlighedCells - Get only highlighted cells  | $('#my').jexcel('getData', false); |  
| **getRowData: get the data from the a row** <br>@Param integer rowNumber - Row number starting from zero.  | $('#my').jexcel('getRowData', 1);  |
| **getColumnData: get the data from the a column**  <br>@Param integer columnNumber - Column number starting from zero.  | $('#my').jexcel('getColumnData', 2);  |
| **setData: Update the table data**  <br>@Param json newData - New data, null will reload what is in memory.<br>@Param boolean ignoreSpare - Ignore configuration of min spare column and rows. | $('#my').jexcel('setData', [data], false); |  
| **insertColumn: add a new column** <br>@Param mixed [array or integer] - Integer as the number of columns to be added. Or array to define the data you would like to insert.<br>@Param json - Properties of the new columns, null to set default.<br>@Param integer columnNumber - Column reference, null to add the new column after the last column. | $('#my').jexcel('insertColumn', 1, null, 3); |  
| **deleteColumn: remove column by number**  <br>@Param integer columnNumber - Which column should be excluded starting on zero <br>@Param integer numOfColumns - How many columns should be deleted  | $('#my').jexcel('deleteColumn', 1); |  
| **insertRow: add a new row**  <br>@Param mixed - Array with the new data or integer with the number of rows should be added<br>@Param rowNumber - Reference where to add the new row.  | $('#my').jexcel('insertRow', 1); |  
| **deleteRow: remove row by number**  <br>@Param integer rowNumber - Which row should be excluded starting on zero<br>@Param integer numberOfRows - How many rows should be excluded | $('#my').jexcel('deleteRow', 1); |  
| **getHeader: get the current header by column number**  <br>@Param integer columnNumber - Column number starting on zero | $('#my').jexcel('getHeader', 2); |  
| **setHeader: change header by column**  <br>@Param integer columnNumber - column number starting on zero<br>@Param string columnTitle - New header title | $('#my').jexcel('setHeader', 1, 'Title'); |  
| **getWidth: get the current column width**  <br>@Param integer columnNumber - column number starting on zero | $('#my').jexcel('getWidth', 2); |  
| **setWidth: change column width**  <br>@Param integer columnNumber - column number starting on zero<br>@Param string newColumnWidth - New column width | $('#my').jexcel('setWidth', 1, 100); |  
| **orderBy: will reorder a column asc or desc**  <br>@Param integer columnNumber - column number starting on zero<br>@Param smallint sortType - Zero will toggle current option, one for desc, two for asc | $('#my').jexcel('orderBy', 2); |  
| **getValue: get current cell value**  <br>@Param mixed cellIdent - str compatible with excel, or as object. | $('#my').jexcel('getValue', 'A1'); |  
| **setValue: change the cell value**  <br>@Param mixed cellIdent - str compatible with excel, or as object.<br>@Param string Value - new value for the cell | $('#my').jexcel('setValue', 'A1'); |  
| **updateSelection: select cells**  <br>@Param object startCell - cell object<br>@Param object endCell - cell object | $('#my').jexcel('updateSelection', [cell], [cell]); |  
| **download: get the current data as a CSV file.**  <br>@Param none | $('#my').jexcel('download'); |  
| **destroy: remove the table and all references and events attached.** <br>@Param none | $('#my').jexcel('destroy'); |  
| **getCell: get the cell object based on a string**  <br>@Param styring cellIdent - str compatible with excel, or as object. | $('#my').jexcel('getCell', 'B1'); |
| **getSelectedCells: get all selected cells**  <br>@Param none | $('#my').jexcel('getSelectedCells'); |
| **undo: undo an action**  <br>@Param none | $('#my').jexcel('undo'); |
| **redo: redo an action**  <br>@Param none | $('#my').jexcel('redo'); |
| **moveRow: move an row to another position**  <br>@Param from - from position y0<br>@Param to - to position y1 | $('#my').jexcel('moveRow', 1, 2); |
| **getStyle: get table or cell style**  <br>@Param mixed - cell identification or null for the whole table. | $('#my').jexcel('getStyle', 'A1');  |
| **setStyle: set cell(s) CSS style**  <br>@Param mixed - json with whole table style information or just one cell identification. Ex. A1.<br>@Param k [optional]- CSS key<br>@Param v [optional]- CSS value | $('#my').jexcel('setSyle', [ { A1:'background-color:red' }, { B1: 'color:red'} ]); |
| **getComments: get cell comments**  <br>@Param mixed - cell identification or null for the whole table. | $('#my').jexcel('getComments', 'A1'); |
| **setComments: set cell comments**  <br>@Param cell - cell identification<br>@Param text - comments | $('#my').jexcel('setComments', 'A1', 'My cell comments!'); |
| **getMeta: get the table or cell meta information**  <br>@Param mixed - cell identification or null for the whole table. | $('#my').jexcel('getMeta', 'A1');  |
| **setMeta: set the table or cell meta information** <br>@Param mixed - json with whole table meta information. | $('#my').jexcel('setMeta', [ A1: { info1:'test' }, { B1: { info2:'test2', info3:'test3'} } ]); |

