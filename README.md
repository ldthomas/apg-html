
apg.html
========

**apg.html** is a web page GUI for developing and testing [SABNF](https://github.com/ldthomas/apg-js2/blob/master/SABNF.md) syntax and the JavaScript **APG** parsers it generates. It has been removed from the [**apg**](https://github.com/ldthomas/apg-js2) repository because of several updates that make it more of an independent project apart from **apg**.

First, it has been updated to use [jQuery](https://www.npmjs.com/package/jquery) for better cross-browser behavior. Second, and more importantly, is the major enhancement of a visual, trace tree using the [d3](https://www.npmjs.com/package/d3) library.

## Installation

The installation uses `less` and `webpack` to bundle the node.js code for the web pages and `docco` to generate the documentation.
````
npm install -g webpack@2.3.3
npm install -g less@2.7.1
npm install -g docco@0.7.0
````

Other versions may work fine. These are the versions that the applications have been tested with.

From GitHub:
````
git clone https://github.com/ldthomas/apg-html.git apg-html
cd apg-html
npm install
````

From npm:
````
npm install apg-html
cd node_modules/apg-html
````

To bundle the applications for web page use and generate the documentation
````
npm run build
./docco-gen
````
To view the documentation, open `docs/setup.html` in any web browser to get started.
Use the "JUMP TO" links in the upper right corner to navigate the documentation for the different pages.

If you want to rebuild the `apg` or `tree` bundles separately,
````
npm run build-apg
npm run build-tree
````

## Usage
**apg.html** is a single web page, driven by (Webpack) bundled JavaScript. In essence, it provides a panel to input an SABNF grammar, generate a parser from it and test it with an input string. For details, click on
````
apg.html
````

and read the Help panel.

New with this version is a feature for viewing a [d3.js](https://github.com/d3/d3/blob/master/API.md) graphic display of the parse tree. The file
````
tree.html
````

can be popped up from **apg.html** (see the Trace Help) or can be run stand-alone with the tree data in a &lt;script> file. Including the helper function
````
js/tree-save.js
````
can assist in getting the data in the right format. See the [examples](https://github.com/ldthomas/apg-js2-examples/tree/master/apg-html)

### Copyright
  *Copyright &copy; 2017 Lowell D. Thomas, all rights reserved*  

### License
Released with the BSD-3-Clause license.
      