import { expect } from "chai";

import jspreadsheet from "../src/index";

describe("Calculations", () => {
  it("Testing formula chain", () => {
    let test = jspreadsheet(root, {
      worksheets: [
        {
          data: [
            ["1", ""],
            ["", ""],
            ["", ""],
            ["", ""],
            ["", ""],
          ],
        },
      ],
    });

    const sheet = test[0]!;
    sheet.setValue?.("B5", "=B3+A1");
    sheet.setValue?.("B3", "=A1+1");
    sheet.setValue?.("A1", "2");

    expect(sheet.getValue?.("B5", true)).to.equal("5");
  });

  describe("Test updating formulas when adding new rows", () => {
    it("1", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "=SUM(A2:C2)"],
              ["4", "5", "6", "=SUM(A2:C2)"],
              ["7", "8", "9", "=SUM(A2:C2)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertRow?.(1, 1, true);

      expect(sheet.getValue?.("D1")).to.equal("=SUM(A3:C3)");
      expect(sheet.getValue?.("D2")).to.equal("");
      expect(sheet.getValue?.("D3")).to.equal("=SUM(A3:C3)");
      expect(sheet.getValue?.("D4")).to.equal("=SUM(A3:C3)");
    });

    it("2", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "=SUM(A2:C3)"],
              ["4", "5", "6", "=SUM(A2:C3)"],
              ["7", "8", "9", "=SUM(A2:C3)"],
              ["10", "11", "12", "=SUM(A2:C3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertRow?.(1, 1, true);

      expect(sheet.getValue?.("D1")).to.equal("=SUM(A3:C4)");
      expect(sheet.getValue?.("D2")).to.equal("");
      expect(sheet.getValue?.("D3")).to.equal("=SUM(A3:C4)");
      expect(sheet.getValue?.("D4")).to.equal("=SUM(A3:C4)");
      expect(sheet.getValue?.("D5")).to.equal("=SUM(A3:C4)");
    });

    it("3", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "=SUM(A2:C3)"],
              ["4", "5", "6", "=SUM(A2:C3)"],
              ["7", "8", "9", "=SUM(A2:C3)"],
              ["10", "11", "12", "=SUM(A2:C3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertRow?.(1, 1, false);

      expect(sheet.getValue?.("D1")).to.equal("=SUM(A2:C4)");
      expect(sheet.getValue?.("D2")).to.equal("=SUM(A2:C4)");
      expect(sheet.getValue?.("D3")).to.equal("");
      expect(sheet.getValue?.("D4")).to.equal("=SUM(A2:C4)");
      expect(sheet.getValue?.("D5")).to.equal("=SUM(A2:C4)");
    });

    it("4", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "=SUM(A2:C3)"],
              ["4", "5", "6", "=SUM(A2:C3)"],
              ["7", "8", "9", "=SUM(A2:C3)"],
              ["10", "11", "12", "=SUM(A2:C3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertRow?.(1, 2, true);

      expect(sheet.getValue?.("D1")).to.equal("=SUM(A2:C4)");
      expect(sheet.getValue?.("D2")).to.equal("=SUM(A2:C4)");
      expect(sheet.getValue?.("D3")).to.equal("");
      expect(sheet.getValue?.("D4")).to.equal("=SUM(A2:C4)");
      expect(sheet.getValue?.("D5")).to.equal("=SUM(A2:C4)");
    });

    it("5", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "=SUM(A2:C3)"],
              ["4", "5", "6", "=SUM(A2:C3)"],
              ["7", "8", "9", "=SUM(A2:C3)"],
              ["10", "11", "12", "=SUM(A2:C3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertRow?.(1, 2, false);

      expect(sheet.getValue?.("D1")).to.equal("=SUM(A2:C3)");
      expect(sheet.getValue?.("D2")).to.equal("=SUM(A2:C3)");
      expect(sheet.getValue?.("D3")).to.equal("=SUM(A2:C3)");
      expect(sheet.getValue?.("D4")).to.equal("");
      expect(sheet.getValue?.("D5")).to.equal("=SUM(A2:C3)");
    });
  });

  describe("Test updating formulas when adding new columns", () => {
    it("1", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3"],
              ["4", "5", "6"],
              ["7", "8", "9"],
              ["=SUM(B1:B3)", "=SUM(B1:B3)", "=SUM(B1:B3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertColumn?.(1, 1, true);

      expect(sheet.getValue?.("A4")).to.equal("=SUM(C1:C3)");
      expect(sheet.getValue?.("B4")).to.equal("");
      expect(sheet.getValue?.("C4")).to.equal("=SUM(C1:C3)");
      expect(sheet.getValue?.("D4")).to.equal("=SUM(C1:C3)");
    });

    it("2", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "4"],
              ["5", "6", "7", "8"],
              ["9", "10", "11", "12"],
              ["=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertColumn?.(1, 1, true);

      expect(sheet.getValue?.("A4")).to.equal("=SUM(C1:D3)");
      expect(sheet.getValue?.("B4")).to.equal("");
      expect(sheet.getValue?.("C4")).to.equal("=SUM(C1:D3)");
      expect(sheet.getValue?.("D4")).to.equal("=SUM(C1:D3)");
      expect(sheet.getValue?.("E4")).to.equal("=SUM(C1:D3)");
    });

    it("3", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "4"],
              ["5", "6", "7", "8"],
              ["9", "10", "11", "12"],
              ["=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertColumn?.(1, 1, false);

      expect(sheet.getValue?.("A4")).to.equal("=SUM(B1:D3)");
      expect(sheet.getValue?.("B4")).to.equal("=SUM(B1:D3)");
      expect(sheet.getValue?.("C4")).to.equal("");
      expect(sheet.getValue?.("D4")).to.equal("=SUM(B1:D3)");
      expect(sheet.getValue?.("E4")).to.equal("=SUM(B1:D3)");
    });

    it("4", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "4"],
              ["5", "6", "7", "8"],
              ["9", "10", "11", "12"],
              ["=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertColumn?.(1, 2, true);

      expect(sheet.getValue?.("A4")).to.equal("=SUM(B1:D3)");
      expect(sheet.getValue?.("B4")).to.equal("=SUM(B1:D3)");
      expect(sheet.getValue?.("C4")).to.equal("");
      expect(sheet.getValue?.("D4")).to.equal("=SUM(B1:D3)");
      expect(sheet.getValue?.("E4")).to.equal("=SUM(B1:D3)");
    });

    it("5", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              ["1", "2", "3", "4"],
              ["5", "6", "7", "8"],
              ["9", "10", "11", "12"],
              ["=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)"],
            ],
            worksheetName: "sheet1",
          },
        ],
      });

      const sheet = test[0]!;
      sheet.insertColumn?.(1, 2, false);

      expect(sheet.getValue?.("A4")).to.equal("=SUM(B1:C3)");
      expect(sheet.getValue?.("B4")).to.equal("=SUM(B1:C3)");
      expect(sheet.getValue?.("C4")).to.equal("=SUM(B1:C3)");
      expect(sheet.getValue?.("D4")).to.equal("");
      expect(sheet.getValue?.("E4")).to.equal("=SUM(B1:C3)");
    });

    it("6", () => {
      let test = jspreadsheet(root, {
        worksheets: [
          {
            data: [
              [1, 2, 3],
              [1, 2, 3],
              [1, 2, 3],
              [1, 2, 3],
              [1, 2, 3],
              ["=SUM(A1:A4)"],
            ],
            minDimensions: [5, 5],
          },
        ],
      });

      const sheet = test[0]!;
      sheet.deleteRow?.(1);

      expect(sheet.getValue?.("A5")).to.equal("=SUM(A1:A3)");
    });
  });
});
