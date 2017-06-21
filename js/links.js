// This module computes and draws all of the links (branch lines), nodes and node text of the tree.
// The all have an initial opacity of 0 (zero) and are invisible.
module.exports = function (base, svg, treeNodes, branchesIncomplete) {
  /* add all links - branch number in class name */
  var color, style, dash;
  svg.treeGroup.selectAll(".link")
      .data(treeNodes.slice(1))
      .enter()
      .append("path")
      .attr("style", function (d) {
        if (d.data.state.name === "MATCH") {
          color = base.colors.cl_match;
        } else if (d.data.state.name === "NOMATCH") {
          color = base.colors.cl_nomatch;
        } else if (d.data.state.name === "EMPTY") {
          color = base.colors.cl_empty;
        } else {
          color = base.colors.cl_active;
        }
        dash = "";
        switch (branchesIncomplete) {
          default:
          case "none":
            break;
          case "left":
            if (d.data.leftMost) {
              dash = "stroke-dasharray: 5,5;";
              color = base.colors.cl_active;
            }
            break;
          case "right":
            if (d.data.rightMost) {
              dash = "stroke-dasharray: 10,5;";
              color = base.colors.cl_active;
            }
            break;
          case "both":
            if (d.data.rightMost || d.data.leftMost) {
              dash = "stroke-dasharray: 15,10,5,10;";
              color = base.colors.cl_active;
            }
            break;
        }
        style = dash + "fill: " + base.link.fill + "; stroke: " + color + "; stroke-width: " + base.link.strokeWidth + "px;";
        return style;
      })
      .attr("class", function (d) {
        return "link branch-" + d.data.branch;
      })
      .attr("opacity", 0)
      .attr("d", function (d) {
        return svg.cubicBezier(d.parent.x, d.parent.y, d.x, d.y);
      });
};
