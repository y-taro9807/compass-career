// Builds src/app.jsx → _app.js (classic JSX runtime, no import statements).
// Usage:  NODE_PATH=/tmp/node_modules node build.js
const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'app.jsx');
const outPath = path.join(__dirname, '_app.js');

const src = fs.readFileSync(srcPath, 'utf8');
const { code } = babel.transformSync(src, {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  filename: 'app.jsx',
});
fs.writeFileSync(outPath, code);
console.log('built _app.js:', code.length, 'chars');
