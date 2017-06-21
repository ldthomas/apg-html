const path = require('path');
module.exports = {
  entry: './js/setup.js',
  output: {
    path: path.resolve(__dirname, "build"),
    filename: 'tree-bundle.js'
  },
  watch: false
};

