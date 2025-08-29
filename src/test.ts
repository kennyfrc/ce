import jspreadsheet from "./index";

import "./jspreadsheet.css";
import "jsuites/dist/jsuites.css";

(window as Window & { jss: unknown }).jss = jspreadsheet;

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
(window as Window & { instance: unknown }).instance = jspreadsheet(root, {
  tabs: true,
  toolbar: true,
  worksheets: [
    {
      minDimensions: [6, 6],
    },
  ],
});
