// Test file to check HTMLElement property conflicts
interface TestHeaderCell extends HTMLElement {
  title?: string;
  width?: number;
  index?: number;
}

const test: TestHeaderCell = document.createElement("td");
test.title = "test";
test.width = 100;
test.index = 0;
