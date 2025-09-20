"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { Code } from "@/app/page";

export async function exportCodeAsZip(
  code: Code,
  filename: string = "ai-web-artisan-project.zip"
) {
  const zip = new JSZip();

  code.pages.forEach(page => {
      const linkedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website - ${page.filename}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
${page.html}
<script src="script.js"></script>
</body>
</html>`;
    zip.file(page.filename, linkedHtml);
  });
  
  zip.file("style.css", code.css);
  zip.file("script.js", code.js);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, filename);
}
