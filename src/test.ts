import jspreadsheet from "./index";

import "./jspreadsheet.css";
import "jsuites/dist/jsuites.css";

(window as any).jss = jspreadsheet;

const root = document.getElementById("root");
(window as any).instance = jspreadsheet(root, {
  tabs: true,
  toolbar: true,
  worksheets: [
    {
      minDimensions: [6, 6],
    },
  ],
});
