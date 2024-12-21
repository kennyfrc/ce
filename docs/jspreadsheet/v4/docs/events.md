title: Spreadsheet Events with Jspreadsheet Version 4
keywords: Jspreadsheet, data grid, JavaScript, Excel-like features, spreadsheet events, event handling, customized actions, JavaScript integration, interactive spreadsheets, feature customization, event-driven programming, data grid events
description: Learn more about Jspreadsheet’s comprehensive event system for advanced customization and integration.
canonical: https://bossanova.uk/jspreadsheet/v4/docs/events

# Spreadsheet Events

## Custom table scripting after changes

Jspreadsheet offers a native feature to customize your table on the fly. You can define the method updateTable to create rules to customize the data should be shown to the user, as the example below.

[See an example in action](/jspreadsheet/v4/examples/table-scripting)

## Events

Jspreadsheet available events in this version.

[Example on handling events on your spreasheet](/jspreadsheet/v4/examples/events)

| Event                    | Description                                                                                                                              |  
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------|  
| **onload**               | This method is called when the method setData                                                                                            |  
| **onbeforechange**       | Before a column value is changed. NOTE: It is possible to overwrite the original value, by returning a new value on this method. v3.4.0+ |  
| **onchange**             | After a column value is changed.                                                                                                         |  
| **onafterchanges**       | After all changes are applied in the table.                                                                                              |  
| **onpaste**              | After a paste action is performed in the JavaScript table.                                                                               |  
| **onbeforepaste**        | Before the paste action is performed. Used to parse any input data, should return the data.                                              |  
| **oninsertrow**          | After a new row is inserted.                                                                                                             |  
| **onbeforeinsertrow**    | Before a new row is inserted. You can cancel the insert event by returning false.                                                        |  
| **ondeleterow**          | After a row is excluded.                                                                                                                 |  
| **onbeforedeleterow**    | Before a row is deleted. You can cancel the delete event by returning false.                                                             |  
| **oninsertcolumn**       | After a new column is inserted.                                                                                                          |  
| **onbeforeinsertcolumn** | Before a new column is inserted. You can cancel the insert event by returning false.                                                     |  
| **ondeletecolumn**       | After a column is excluded.                                                                                                              |  
| **onbeforedeletecolumn** | Before a column is excluded. You can cancel the insert event by returning false.                                                         |  
| **onmoverow**            | After a row is moved to a new position.                                                                                                  |  
| **onmovecolumn**         | After a column is moved to a new position.                                                                                               |  
| **onresizerow**          | After a change in row height.                                                                                                            |  
| **onresizecolumn**       | After a change in column width.                                                                                                          |  
| **onselection**          | On the selection is changed.                                                                                                             |  
| **onsort**               | After a column is sorted.                                                                                                                |  
| **onfocus**              | On table focus                                                                                                                           |  
| **onblur**               | On table blur                                                                                                                            |  
| **onmerge**              | On column merge                                                                                                                          |  
| **onchangeheader**       | On header change                                                                                                                         |  
| **onundo**               | On undo is applied                                                                                                                       |  
| **onredo**               | On redo is applied                                                                                                                       |  
| **oneditionstart**       | When openEditor is called.                                                                                                               |  
| **oneditionend**         | When closeEditor is called.                                                                                                              |  
| **onchangestyle**        | When setStyle is called.                                                                                                                 |  
| **onchangemeta**         | When setMeta is called.                                                                                                                  |
