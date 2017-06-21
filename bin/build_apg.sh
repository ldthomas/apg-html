#!/bin/bash
#
# build css
cat ./css/apg-lib.css ./css/apg-html.less | lessc - ./build/apg-html.css
#
#build js
webpack --config webpack.config-apg.js
#
exit 0
