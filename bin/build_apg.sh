#!/bin/bash
#
# build css
cat ./node_modules/apg-lib/apg-lib.css ./css/apg-html.less | lessc - ./build/apg-html.css
#
#build js
webpack --config webpack.config-apg.js
#
exit 0
