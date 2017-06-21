// This module hold basic page information for the other modules to use.
module.exports = function (config){
  function getScrollBars(){
    var test = d3.select("body")
    .append("div")
    .style("width", "100px")
    .style("height", "100px");
    var wo = {
        verticalScroll: test.property("clientWidth"),
        horizScroll: test.property("clientHeight")
    };
    test.remove();
    test = d3.select("body")
    .append("div")
    .style("overflow", "scroll")
    .style("width", "100px")
    .style("height", "100px");
    var ws = {
        verticalScroll: test.property("clientWidth"),
        horizScroll: test.property("clientHeight")
    };
    test.remove();
    return {
        verticalBar: wo.verticalScroll - ws.verticalScroll,
        horizontalBar: wo.horizScroll - ws.horizScroll
    };
  }
  this.getViewPort = function(){
    return {
      width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    };
  };
  this.scrollBars = getScrollBars();
  this.classes = config.classes;
  this.colors = config.colors;
  this.circle = config.circle;
  this.link = config.link;
  config.tooltip.height = 2 * config.tooltip.fontSize;
  this.tooltip = config.tooltip;
};
