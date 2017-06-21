#!/bin/bash
#
# build css
cat ./css/tree-variables.less ./css/tree-base.less ./css/tree.less | lessc - ./build/tree.css
#
#build js
webpack --config webpack.config-tree.js
#
exit 0
