// This module prepares the SVG for the parse tree and the input string.
// The SVG appends an outer group to handle pan and zoom events.
// As children of the outer group are two groups, one each for the parse tree and the input string text.
// The parse tree and input string text each have their own presentation rectangle .
// 
// The program works iteratively:
// - first it generates an SVG element that occupies the entire view port
// - it then computes the tree nodes in the view port tree rectangle
// - it then evaluates the spacings between the generated tree nodes
// - if the spacings, x or y, are too close, the tree rectangle is expanded
// - the new SVG element is resized accordingly
// - finally, the tree and text rectangles are properly placed in the updated SVG element 
module.exports = function (_base, _control, config, data) {
  var _this = this;
  var base = _base;
  var control = _control;

  /* public functions and objects */

  /* some values to be share with other objects */
  this.duration = config.duration;
  this.textType = config.textType;
  this.circleRadius = base.circle.radius;
  this.root;
  this.outerGroup;
  this.treeGroup;
  this.textGroup;
  this.textRect = {};
  this.treeRect = {};
  this.textString = {};
  this.svgElement;
  this.scale;
  this.init;

  /* Draws a linear line from (formX, fromY) to (toX, toY). */
  this.linear = function (toX, toY, fromX, fromY) {
    return "M" + toX + "," + toY + "L" + fromX + "," + fromY;
  };
  /* Draws a cubic Bezier line from (formX, fromY) to (toX, toY) */
  this.cubicBezier = function (toX, toY, fromX, fromY) {
    return "M" + toX + "," + toY + "C" + toX + "," + (toY + fromY) / 2 + " " + fromX + "," + (toY + fromY) / 2 + " " + fromX + "," + fromY;
  };
  
  /* private functions and objects */
  var zoom = d3.zoom().on("zoom", zoomed);

  /* handle the pan and zoom events */
  function zoomed() {
    _this.outerGroup.attr("transform", d3.event.transform);
  }

  /* initialize the SVG rectacgle to the view port */
  function svgInit(view, textWidth) {
    var svg = {};
    svg.top = control.size.height;
    svg.left = 0;
    svg.height = view.height - control.size.height;
    svg.width = Math.max(view.width, textWidth);
    return svg;
  }
  
  /* computes the final svg from initial, trial tree and text rects */
  function svgFromTreeAndText(margin, tree, text) {
    var svg = {};
    svg.top = control.size.height;
    svg.left = 0;
    svg.height = margin.top + margin.middle + margin.bottom + tree.height + text.height;
    svg.width = margin.left + margin.right + Math.max(tree.width, text.width);
    return svg;
  }
  
  /* recomputes the tree and text rexts from the final svg */
  function rectsFromSvg(margin, svgRect, textHeight) {
    var tree = {};
    var text = {};
    tree.top = margin.top;
    tree.left = margin.left;
    tree.width = svgRect.width - (margin.left + margin.right);
    tree.height = svgRect.height - (margin.top + margin.middle + margin.bottom + textHeight);
    text.top = svgRect.height - (margin.bottom + textHeight);
    text.left = margin.left;
    text.width = svgRect.width - (margin.left + margin.right);
    text.height = textHeight;
    return {
      tree: tree,
      text: text
    };
  }
  
  /* evaluate the node spacings and recompute the tree size, if necessary */
  function resizeTree(radius, root) {
    var minSep = {x: 2 * radius + 4, y: 2 * radius + 4};
    var x = {min: Infinity, max: 0, sep: Infinity};
    var y = {min: Infinity, max: 0, sep: Infinity};
    var prevY = false;
    var prevX = false;
    root.each(function (node) {
      if (node.x < x.min) {
        x.min = node.x;
      }
      if (node.x > x.max) {
        x.max = node.x;
      }
      if (node.y < y.min) {
        y.min = node.y;
      }
      if (node.y > y.max) {
        y.max = node.y;
      }
      if (prevY === false) {
        prevY = node.y;
      } else {
        if (prevY !== node.y) {
          /* set up for next row */
          if (node.y - prevY < y.sep) {
            y.sep = node.y - prevY;
          }
          prevX = false;
          prevY = node.y;
        } else {
          if (prevX === false) {
            prevX = node.x;
          } else {
            /* compute delta x */
            if (node.x - prevX < x.sep) {
              x.sep = node.x - prevX;
            }
            prevX = node.x;
          }
        }
      }
    });
    var max = {width: null, height: null};
    if (x.sep < minSep.x) {
      max.width = x.min + (minSep.x / x.sep) * x.max + minSep.x;
    }
    if (y.sep < minSep.y) {
      max.height = y.min + (minSep.y / y.sep) * y.max;
    }
    return max;
  }
  
  /* compute the font height and text width*/
  function textSize(displayChars) {
    var width = 0;
    var height = 0;
    var sel = d3.select("#svg-container")
        .append("svg").attr("display", "block")
        .attr("visibility", "hidden");
    var gel = sel.append("g");
    var tel = gel.append("text")
        .selectAll("tspan")
        .data(displayChars)
        .enter()
        .append("tspan")
        .attr("class", function (d) {
          return d.cls;
        })
        .text(function (d) {
          return d.str;
        });
    tel.each(function (d, i) {
      var node = d3.select(this).node();
      d.width = node.getComputedTextLength();
      width += d.width;
      d.beg = node.getExtentOfChar(0).x;
      d.end = d.beg + d.width;
      for (var i = 0; i < d.str.length; i += 1) {
        var h = node.getExtentOfChar(i).height;
        if (h > height) {
          height = h;
        }
      }
    });
    sel.remove();
    return {
      fontSize: height,
      width: width,
      top: 1.5 * height,
      displayChars: displayChars
    };
  }

  /* constructor */
  /* step 1) get the text size - font height and string width */
  var charCodesToDisplay = require("./text.js");
  this.textString = textSize(charCodesToDisplay(base, data.string, config.textType));

  /* fit the text rect around it */
  this.textRect.width = this.textString.width;
  this.textRect.height = 2.5 * this.textString.fontSize;

  /* step 2) initialize the svg to the port view */
  var svgRect = svgInit(base.getViewPort(), this.textRect.width);

  /* step 3) get initial tree and text rects from the initial svg */
  var tmp = rectsFromSvg(config.margin, svgRect, this.textRect.height);
  this.treeRect = tmp.tree;
  this.textRect = tmp.text;

  /* step 4) put the nodes in the initial tree rect */
  var hier = d3.hierarchy(data.tree);
  var treemap = d3.tree().size([this.treeRect.width, this.treeRect.height]);
  this.root = treemap(hier);
  var treeSize = resizeTree(base.circle.radius, this.root);

  /* resize the tree rect if the nodes are too close together */
  if (treeSize.width) {
    this.treeRect.width = treeSize.width;
  }
  if (treeSize.height) {
    this.treeRect.height = treeSize.height;
  }

  /* step 5) re-compute svg rect from the (resized) tree and text rects */
  svgRect = svgFromTreeAndText(config.margin, this.treeRect, this.textRect);

  /* step 6) re-compute tree rect and text rects: fit them proberly in the final svg*/
  tmp = rectsFromSvg(config.margin, svgRect, this.textRect.height);
  this.treeRect = tmp.tree;
  this.textRect = tmp.text;
  treemap = d3.tree().size([this.treeRect.width, this.treeRect.height]);
  this.root = treemap(hier);

  /* center the text in the text rect */
  this.textString.left = (this.textRect.width - this.textString.width) / 2;

  /* step 7) append the svg element */
  this.svgElement = d3.select("#svg-container")
      .attr("style", "top: " + svgRect.top + "px; left " + svgRect.left + "px;")
      .append("svg")
      .attr("display", "block")
      .attr("cursor", "move")
      .attr("width", "" + svgRect.width)
      .attr("height", "" + svgRect.height)
      .call(zoom)
      .on("dblclick.zoom", null);

  /* step 8) create an outer group for zoom and pan: text and tree are children of outer group */
  this.outerGroup = this.svgElement.append("g");

  /* step 9) construct the tree group and put the tree rect in it */
  this.treeGroup = this.outerGroup.append("g")
      .attr("transform", "translate(" + this.treeRect.left + "," + this.treeRect.top + ")")
      .attr("style", "overflow: hidden;");
  this.treeGroup.append("rect")
      .attr("width", "" + this.treeRect.width)
      .attr("height", "" + this.treeRect.height)
      .attr("stroke", config.border.color)
      .attr("stroke-width", config.border.width + "px")
      .attr("fill", config.border.fill);

  /* step 10) append the text group and put the text rect in it */
  this.textGroup = this.outerGroup.append("g")
      .attr("transform", "translate(" + this.textRect.left + "," + this.textRect.top + ")");
  this.textGroup.append("rect")
      .attr("width", "" + this.textRect.width)
      .attr("height", "" + this.textRect.height)
      .attr("stroke", config.border.color)
      .attr("stroke-width", config.border.width + "px")
      .attr("fill", config.border.fill);

  /* step 11) append the text to the text group and add the characters to it */
  this.textElement = this.textGroup.append("text")
      .attr("x", this.textString.left)
      .attr("y", this.textString.top);
  this.textElement.selectAll("tspan")
      .data(this.textString.displayChars)
      .enter()
      .append("tspan")
      .attr("class", function (d) {
        return d.cls;
      })
      .attr("style", function (d) {
        return "fill: " + base.colors.cl_black + ";";
      })
      .text(function (d) {
        return d.str;
      });

  /* step 12) set up fro manual zooming */
  var trans = d3.zoomTransform(this.svgElement.node());
  trans.x = 0;
  trans.y = 0;
  this.scale = {
    fit: function () {
      var wk = 1;
      var hk = 1;
      var vp = base.getViewPort();
      if (svgRect.width > vp.width) {
        wk = vp.width / svgRect.width;
      }
      if (svgRect.height > vp.height) {
        hk = vp.height / svgRect.height;
      }
      trans.k = Math.min(wk, hk);
      zoom.transform(_this.svgElement, trans);
    },
    s200: function () {
      trans.k = 2;
      zoom.transform(_this.svgElement, trans);
    },
    s100: function () {
      trans.k = 1;
      zoom.transform(_this.svgElement, trans);
    },
    s75: function () {
      trans.k = 0.75;
      zoom.transform(_this.svgElement, trans);
    },
    s50: function () {
      trans.k = 0.5;
      zoom.transform(_this.svgElement, trans);
    },
    s25: function () {
      trans.k = 0.25;
      zoom.transform(_this.svgElement, trans);
    }
  };

  /* Initialize the scale of the display */
  this.init = function (size) {
    if (typeof (size) === "string") {
      switch (size) {
        case "200":
          this.scale.s200();
          break;
        case "100":
          this.scale.s100();
          break;
        case "75":
          this.scale.s75();
          break;
        case "50":
          this.scale.s50();
          break;
        case "25":
          this.scale.s25();
          break;
        default:
          this.scale.fit();
          break;
      }

    } else {
      this.scale.fit();
    }
  };
};
