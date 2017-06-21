const path = require('path');
module.exports = {
  entry: './js/apg-html.js',
  output: {
    path: path.resolve(__dirname, "build"),
    filename: 'apg-html-bundle.js'
  },
  watch: false
};

