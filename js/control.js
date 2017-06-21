// This module creates the control panel at the top of the screen.
// It has the drop-down menu for zooming and the step and slider controls for the tree branch display.
module.exports = function (base, config) {
  /* private helper functions */
  var prevValue = 0;
  function begin() {
    var index = show.begin();
    slider.property("value", "" + index);
  }
  function back() {
    var index = show.back();
    slider.property("value", "" + index);
  }
  function goto() {
    prevValue = parseInt(this.value, 10);
    show.goto(prevValue);
  }
  function forward() {
    var index = show.forward();
    slider.property("value", "" + index);
  }
  function end() {
    var index = show.end();
    slider.property("value", "" + index);
  }
  function slide() {
    var thisValue = parseInt(this.value, 10);
    if (thisValue > prevValue) {
      for (var i = 0; i < (thisValue - prevValue); i += 1) {
        show.forward();
      }
      prevValue = thisValue;
    } else if (thisValue < prevValue) {
      for (var i = 0; i < (prevValue - thisValue); i += 1) {
        show.back();
      }
      prevValue = thisValue;
    }
  }
  function setDefault() {
    d3.select(this).style("cursor", "default");
  }
  function setPointer() {
    d3.select(this).style("cursor", "pointer");
  }
  var show = {
    begin: undefined,
    back: undefined,
    goto: undefined,
    forward: undefined,
    end: undefined
  };
  var scale = {
    fit: undefined,
    s200: undefined,
    s100: undefined,
    s75: undefined,
    s50: undefined,
    s25: undefined
  };

  /* public functions */
  /* Once the nodes and branches have been created, this connects the controls to the branch display functions. */
  this.setShowControls = function (fn) {
    show.begin = fn.begin;
    show.back = fn.back;
    show.goto = fn.goto;
    show.forward = fn.forward;
    show.end = fn.end;
  };
  /* This connects the drop-down box scaling control with the presentation of the SVG element.*/
  this.setScaleControls = function (fn) {
    scale.fit = fn.fit;
    scale.s200 = fn.s200;
    scale.s100 = fn.s100;
    scale.s75 = fn.s75;
    scale.s50 = fn.s50;
    scale.s25 = fn.s25;
  };
  function changeScale() {
    this.blur();
    switch (this.value) {
      case "200":
        scale.s200();
        break;
      case "100":
        scale.s100();
        break;
      case "75":
        scale.s75();
        break;
      case "50":
        scale.s50();
        break;
      case "25":
        scale.s25();
        break;
      case "reset":
      case "fit":
      default:
        scale.fit();
        break;
    }
  }
  // Initialize the tree display.
  // - pos: "begin" or "end"
  // - defaults to configured position
  this.init = function (pos) {
    if (show.begin) {
      pos = (typeof (pos) === "string") ? pos.toLowerCase() : this.initialPosition;
      switch (pos) {
        case "begin":
          begin();
          break;
        default:
        case "end":
          end();
          break
      }
    }
  };
  /* constructor: setup */
  var scaleControl = d3.select("#scale-control")
      .attr("style", "float: left; margin: 10px 0 0 30px;")
      .on("change", changeScale);
  scaleControl.append("option")
      .attr("value", "fit")
      .text("fit to page");
  scaleControl.append("option")
      .attr("value", "200")
      .text("200%");
  scaleControl.append("option")
      .attr("value", "100")
      .text("100%");
  scaleControl.append("option")
      .attr("value", "75")
      .text("75%");
  scaleControl.append("option")
      .attr("value", "50")
      .text("50%");
  scaleControl.append("option")
      .attr("value", "25")
      .text("25%");
  scaleControl.append("option")
      .attr("value", "reset")
      .text("reset");
  var control = d3.select("#control-container");
  var inner = d3.select("#inner-control");
  var buttonStyle = "width: " + config.buttonWidth + "px;";
  buttonStyle += "height: " + config.buttonHeight + "px;";
  inner.append("button")
      .attr("class", "control-button")
      .attr("style", buttonStyle)
      .property("innerHTML", "\u23EE")
      .on("click", begin)
      .on("mouseout", setDefault)
      .on("mouseover", setPointer);

  inner.append("span")
      .property("innerHTML", "&nbsp;");

  inner.append("button")
      .attr("class", "control-button")
      .attr("style", buttonStyle)
      .property("innerHTML", "\u25C0")
      .on("click", back)
      .on("mouseout", setDefault)
      .on("mouseover", setPointer);

  inner.append("span")
      .property("innerHTML", "&nbsp;");
  var slider = inner.append("input")
      .attr("type", "range")
      .attr("min", "" + config.sliderMin)
      .attr("max", "" + config.sliderMax)
      .attr("value", "0")
      .style("width", +config.sliderWidth + "px")
      .style("vertical-align", "middle")
      .on("input", slide)
      .on("change", goto)
      .on("mouseout", setDefault)
      .on("mouseover", setPointer);

  inner.append("span")
      .property("innerHTML", "&nbsp;");

  inner.append("button")
      .attr("class", "control-button")
      .attr("style", buttonStyle)
      .property("innerHTML", "\u25B6")
      .on("click", forward)
      .on("mouseout", setDefault)
      .on("mouseover", setPointer);

  inner.append("span")
      .property("innerHTML", "&nbsp;");

  inner.append("button")
      .attr("class", "control-button")
      .attr("style", buttonStyle)
      .property("innerHTML", "\u23ED")
      .on("click", end)
      .on("mouseout", setDefault)
      .on("mouseover", setPointer);

  var width = 0;
  inner.selectAll("div *")
      .filter(function (d) {
        var offset = d3.select(this).property("offsetWidth");
        width += offset + 2;
      });
  inner.style("width", (width + 10) + "px");
  this.size = {
    height: control.property("clientHeight"),
    width: control.property("clientWidth")
  };
  control.attr("style", "top: 0px; left: 0px;");
  /* set up the initial tree state: defaults to "end" */
  if (typeof (config.initialPosition) === "string") {
    this.initialPosition = config.initialPosition.toLowerCase();
    switch (this.initialPosition) {
      case "begin":
      case "end":
        break;
      default:
        this.initialPosition = "end";
    }
  }
};
