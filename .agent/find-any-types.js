#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Find all TypeScript files in src directory
const srcDir = path.join(__dirname, "..", "src");
const files = [];

function findTypeScriptFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findTypeScriptFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
}

findTypeScriptFiles(srcDir);

console.log("Analyzing any types in TypeScript files...\n");

const results = [];
let totalAnyCount = 0;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  const anyMatches = [];

  lines.forEach((line, index) => {
    // Match any types but exclude comments and string literals
    const anyRegex = /\bany\b(?!\s*[\/\*])/g;
    let match;

    while ((match = anyRegex.exec(line)) !== null) {
      // Check if this is in a comment or string
      const lineBeforeMatch = line.substring(0, match.index);
      const commentStart = lineBeforeMatch.lastIndexOf("//");
      const blockCommentStart = lineBeforeMatch.lastIndexOf("/*");
      const blockCommentEnd = lineBeforeMatch.lastIndexOf("*/");

      const isInComment =
        (commentStart !== -1 &&
          commentStart > (blockCommentEnd !== -1 ? blockCommentEnd : -1)) ||
        (blockCommentStart !== -1 &&
          (blockCommentEnd === -1 || blockCommentStart > blockCommentEnd));

      if (!isInComment) {
        anyMatches.push({
          line: index + 1,
          text: line.trim(),
          column: match.index + 1,
        });
      }
    }
  });

  if (anyMatches.length > 0) {
    results.push({
      file: path.relative(process.cwd(), file),
      count: anyMatches.length,
      matches: anyMatches,
    });
    totalAnyCount += anyMatches.length;
  }
}

// Sort by count descending
results.sort((a, b) => b.count - a.count);

console.log(
  `Found ${totalAnyCount} any types across ${results.length} files:\n`,
);

for (const result of results) {
  console.log(`${result.file}: ${result.count} any types`);

  // Show top 5 matches for each file
  for (let i = 0; i < Math.min(3, result.matches.length); i++) {
    const match = result.matches[i];
    console.log(
      `  Line ${match.line}: ${match.text.substring(0, 80)}${match.text.length > 80 ? "..." : ""}`,
    );
  }

  if (result.matches.length > 3) {
    console.log(`  ... and ${result.matches.length - 3} more`);
  }
  console.log("");
}

console.log(`\nTotal any types found: ${totalAnyCount}`);

// Write detailed report to file
const reportPath = path.join(__dirname, "any-types-report.txt");
const reportContent = [];

reportContent.push(`Any Types Analysis Report - ${new Date().toISOString()}`);
reportContent.push(`Total any types: ${totalAnyCount}`);
reportContent.push(`Files with any types: ${results.length}`);
reportContent.push("");

for (const result of results) {
  reportContent.push(`${result.file}: ${result.count} any types`);

  for (const match of result.matches) {
    reportContent.push(`  Line ${match.line}: ${match.text}`);
  }

  reportContent.push("");
}

fs.writeFileSync(reportPath, reportContent.join("\n"));
console.log(`\nDetailed report written to: ${reportPath}`);
