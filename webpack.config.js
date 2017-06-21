const path = require('path');
module.exports = {
  entry: {
    "apg-html-bundle": './js/apg-html.js',
    "tree-bundle": './js/setup.js',
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: '[name].js'
  },
  watch: false
};

