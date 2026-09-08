#!/usr/bin/env node
// Injects partials/nav.html and partials/footer.html into each pages/*.html
// file and writes the result to public/, its route: pages/index.html ->
// public/index.html, pages/media.html -> public/media/index.html, etc.
// Rerun after editing partials or pages. public/ is wiped and rebuilt each run.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const pagesDir = path.join(root, 'pages');
const outRoot = path.join(root, 'public');
const nav = fs.readFileSync(path.join(root, 'partials', 'nav.html'), 'utf8');
const footer = fs.readFileSync(path.join(root, 'partials', 'footer.html'), 'utf8');

fs.rmSync(outRoot, { recursive: true, force: true });

const assetsDir = path.join(root, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(outRoot, 'assets'), { recursive: true });
  console.log('copied assets/');
}

for (const file of fs.readdirSync(pagesDir)) {
  if (!file.endsWith('.html')) continue;
  const name = path.basename(file, '.html');
  const outDir = name === 'index' ? outRoot : path.join(outRoot, name);
  const outPath = path.join(outDir, 'index.html');

  let html = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  html = html.replace('<!--NAV-->', nav).replace('<!--FOOTER-->', footer);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`built ${path.relative(root, outPath)}`);
}
