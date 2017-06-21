#!/bin/bash
#
# build css
cat ./css/apg-lib.css ./css/apg-html.less | lessc - ./build/apg-html.css
cat ./css/tree-variables.less ./css/tree-base.less ./css/tree.less | lessc - ./build/tree.css
#
#build js
webpack --config webpack.config.js
#
exit 0
