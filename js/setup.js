// This function controls the other objects to set up the entire tree and input text.
// It attaches the d3.js object to the setup function to the window object.
window.d3 = require("d3");
window.treeSetup = function () {
  function getMode(mode){
    mode = mode.slice(3).toLowerCase();
    switch (mode) {
      case "asc":
        mode = "ascii";
        break;
      case "dec":
        mode = "decimal";
        break;
      case "hex":
        mode = "hexidecimal";
        break;
      default:
      case "uni":
        mode = "unicode";
        break;
    }
    return mode;
  }
  
  //It first attempts to find the data pre-defined in a &lt;script> tag.
  //If the &lt;script> tag exists, the data must appear in the form of 
  //````
  //'var parseTree = 'JSON string';
  //'var displayMode = 'unicode'; (default)
  //  - 'ascii'
  //  - 'decimal'
  //  - 'hexidecimal'
  //````
  var data, mode;
  try {
    data = JSON.parse(window.parseTree);
  } catch (e) {
    data = null;
  }
  if (data) {
    try {
      mode = getMode(window.displayMode);
    } catch (e) {
      mode = "unicode";
    }
  }
  
  // If no &lt;script> tag exists, then look for the JSON tree data in local storage.
  if(!data){
    var parseTree = localStorage.getItem("parseTree");
    if (parseTree) {
      data = JSON.parse(parseTree);
      localStorage.removeItem("parseTree");
      var displayMode = localStorage.getItem("displayMode");
      if(displayMode){
        mode = getMode(displayMode);
        localStorage.removeItem("displayMode");
      }
    } else {
      // If no 'parseTree' variable can be found, throw an exception and exit
      throw new Error("tree setup.js: no parseTree data available");
    }
  }
  
  // Some configuration data for some degree of control over the SVG area and objects.
  var colors = {
    /* Solarized Palette - http://ethanschoonover.com/solarized */
    solor_lightgray: "#819090",
    solor_gray: "#708284",
    solor_mediumgray: "#536870",
    solor_darkgray: "#475B62",
    solor_darkblue: "#0A2933",
    solor_darkerblue: "#042029",
    solor_paleryellow: "#FCF4DC",
    solor_paleyellow: "#EAE3CB",
    solor_yellow: "#A57706",
    solor_orange: "#BD3613",
    solor_red: "#D11C24",
    solor_pink: "#C61C6F",
    solor_purple: "#595AB7",
    solor_blue: "#2176C7",
    solor_cyan: "#259286",
    solor_green: "#738A05",
    solor_lightgreen: "#00CC00"
  };

  /* APG colors */
  colors.cl_white = "#FFFFFF";
  colors.cl_black = "#000000";
  colors.cl_lookahead_match = "#1A97BA";
  colors.cl_lookbehind_match = "#5F1687";
  colors.cl_match = colors.solor_blue;
  colors.cl_nomatch = colors.solor_red;
  colors.cl_empty = colors.solor_lightgreen;
  colors.cl_active = colors.solor_yellow;
  colors.cl_normal = colors.cl_black;
  colors.cl_prefix = "#0080FF";
  colors.cl_phrase = "#0040FF";
  colors.cl_suffix = colors.solor_lightgray;
  var classes = {
    normal: "normal",
    ctrl: "ctrl",
    prefixNormal: "prefix-normal",
    prefixCtrl: "prefix-ctrl",
    phraseNormal: "phrase-normal",
    phraseCtrl: "phrase-ctrl",
    suffixNormal: "suffix-normal",
    suffixCtrl: "suffix-ctrl"
  };
  var configBase = {
    colors: colors,
    classes: classes,
    circle: {
      radius: 10,
      fill: colors.cl_white,
      strokeWidth: 2
    },
    link: {
      fill: "none",
      strokeWidth: 2
    },
    tooltip: {
      height: 0,
      width: 200,
      offset: 5,
      fontSize: 12,
      opacity: .75,
      fill: colors.solor_paleryellow,
      strokeColor: colors.solor_darkgray,
      strokeWidth: 1,
      dragStrokeColor: colors.solor_darkgray,
      dragStrokeWidth: 2,
      cornerRadius: 5
    }
  };
  var configControl = {
    initialPosition: "end",
    borderWidth: 2,
    buttonHeight: 22,
    buttonWidth: 30,
    buttonMargin: 5,
    sliderWidth: 500,
    sliderMin: 0,
    sliderMax: data.leafNodes
  };
  var configSvg = {
    duration: 200,
    textType: "uni",
    treeMin: {
      width: 500,
      height: 500
    },
    margin: {
      top: 20,
      left: 10,
      bottom: 10,
      right: 10,
      middle: 20
    },
    border: {
      width: 2,
      color: colors.cl_black,
      fill: colors.cl_white
    }
  };
  
  // This controls the display mode of the input string text
  configSvg.textType = mode;

  // Aquire the basic objects and constructors
  var Base = require("./base.js");
  var Control = require("./control.js");
  var Presentation = require("./presentation.js");
  var links = require("./links.js");
  var nodes = require("./nodes.js");
  var Show = require("./show.js");
  var Phrases = require("./phrases.js");
  var Tooltips = require("./tooltips.js");
  var base = new Base(configBase);

  // Set up the control (slider) bar.
  var control = new Control(base, configControl);

  // Set up the SVG area with boxes for the tree and input string text.
  var svg = new Presentation(base, control, configSvg, data);

  // Set the drop-down box zoom/scaling functions in the control.
  control.setScaleControls(svg.scale);

  // Create the links (tree branch lines.)
  var treeNodes = svg.root.descendants();
  links(base, svg, treeNodes, data.branchesIncomplete);

  // Create the tree node symbols on the branches
  var phrases = new Phrases(base, svg);
  var tooltips = new Tooltips(base, svg);
  nodes(base, svg, phrases, tooltips, treeNodes);

  // Create the control's animation functions and link them to the control buttons and slider.
  var show = new Show(svg, svg.root, phrases);
  control.setShowControls(show);

  // Always display the root node.
  svg.treeGroup.select(".node.branch-0")
      .attr("opacity", function (d) {
        d.data.isVisible = true;
        return 1;
      });

  // Initialize the display.
  control.init();
  svg.init();
};
