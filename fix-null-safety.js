const fs = require("fs");
const path = require("path");

// Find all test files
const testDir = path.join(__dirname, "test");
const testFiles = fs
  .readdirSync(testDir)
  .filter((file) => file.endsWith(".ts"));

// Process each test file
testFiles.forEach((file) => {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Add null checks for DOM element queries
  content = content.replace(
    /(\s*)(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*root\.querySelector\(([^)]+)\)\s*;?/g,
    "$1$2 $3 = root.querySelector($4);\n$1if (!$3) throw new Error('Element not found');"
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Fixed null checks in ${file}`);
});

console.log("All test files updated with null checks");
