const fs = require("fs");
const path = require("path");

// Find all test files
const testDir = path.join(__dirname, "test");
const testFiles = fs
  .readdirSync(testDir)
  .filter((file) => file.endsWith(".ts"));

// Pattern to match DOM element queries that need null checks
const patterns = [
  /(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*root\.querySelector\([^)]+\)\s*;?\s*\n\s*(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\2\.children/g,
  /(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*root\.querySelector\([^)]+\)\s*;?\s*\n\s*expect\(\2\./g,
];

const replacement =
  "$1 $2 = root.querySelector($3);\nif (!$2) throw new Error('Element not found');\n$4 $5 = $2.children";

// Process each test file
testFiles.forEach((file) => {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Add null checks for DOM element queries
  content = content.replace(
    /(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*root\.querySelector\([^)]+\)\s*;?/g,
    "$1 $2 = root.querySelector($3);\nif (!$2) throw new Error('Element not found');"
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Fixed null checks in ${file}`);
});

console.log("All test files updated with null checks");
