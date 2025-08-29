import jspreadsheet from "./index";
import "./jspreadsheet.css";
import "jsuites/dist/jsuites.css";
declare global {
    interface Window {
        jss?: typeof jspreadsheet;
        instance?: ReturnType<typeof jspreadsheet>;
    }
}
//# sourceMappingURL=test.d.ts.map