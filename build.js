#!/usr/bin/env node
// Injects partials/header.html and partials/footer.html into each pages/*.html
// file and writes the result to its route: pages/index.html -> index.html,
// pages/media.html -> media/index.html, etc. Rerun after editing partials or pages.
// Also removes generated route directories left behind by a deleted/renamed page.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const pagesDir = path.join(root, 'pages');
const header = fs.readFileSync(path.join(root, 'partials', 'header.html'), 'utf8');
const footer = fs.readFileSync(path.join(root, 'partials', 'footer.html'), 'utf8');

const skipDirs = new Set(['.git', 'pages', 'partials', 'node_modules']);
const routeNames = fs.readdirSync(pagesDir)
  .filter(f => f.endsWith('.html'))
  .map(f => path.basename(f, '.html'))
  .filter(name => name !== 'index');

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || skipDirs.has(entry.name) || routeNames.includes(entry.name)) continue;
  const stale = path.join(root, entry.name, 'index.html');
  if (fs.existsSync(stale)) {
    fs.rmSync(path.join(root, entry.name), { recursive: true });
    console.log(`removed stale ${entry.name}/`);
  }
}

for (const file of fs.readdirSync(pagesDir)) {
  if (!file.endsWith('.html')) continue;
  const name = path.basename(file, '.html');
  const outDir = name === 'index' ? root : path.join(root, name);
  const outPath = path.join(outDir, 'index.html');

  let html = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  html = html.replace('<!--HEADER-->', header).replace('<!--FOOTER-->', footer);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`built ${path.relative(root, outPath)}`);
}
