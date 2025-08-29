        if (libraryBase.jspreadsheet.current.resizing?.element) {
          libraryBase.jspreadsheet.current.resizing.element.classList.remove(
            "resizing"
          );
        }
      }
      // Reset resizing helper
      libraryBase.jspreadsheet.current.resizing = null;
    } else if (libraryBase.jspreadsheet.current.dragging) {
      // Reset dragging helper
      if (libraryBase.jspreadsheet.current.dragging) {
        if (libraryBase.jspreadsheet.current.dragging.column) {
          // Target
          const columnId =
            e.target && e.target instanceof HTMLElement
              ? e.target.getAttribute("data-x")
              : null;
          // Remove move style
          const column = libraryBase.jspreadsheet.current.dragging.column;
          libraryBase.jspreadsheet.current.headers[
            column
const test = () => {
};
