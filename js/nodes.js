// This module computes and draws all of the nodes of the tree.
// They all have an initial opacity of 0 (zero) and are invisible.
// Also, handles the toggling of the node tooltips 
module.exports = function (base, svg, phrases, tooltips, treeNodes) {
  "use strict";
  var colors = base.colors;
  var circle = base.circle;

  /* add a group for each node */
  var nodeSelection = svg.treeGroup.selectAll(".node")
      .data(treeNodes)
      .enter()
      .append("g")
      .attr("opacity", function (d) {
        d.data.visible = false;
        return 0;
      })
      .attr("class", function (d) {
        var c = "node" + " branch-" + d.data.branch;
        return c;
      })
      .attr("id", function (d) {
        var c = "node" + " branch-" + d.data.branch;
        return "node-" + d.data.id;
      })
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

  /* add a circle to each node */
  var circleStyle = "fill: " + circle.fill + ";";
  circleStyle += "stroke-width: " + circle.strokeWidth + "px;";
  nodeSelection.append("circle")
      .attr("style", function (d) {
        var color;
        if (d.data.state.name === "MATCH") {
          color = colors.cl_match;
        } else if (d.data.state.name === "NOMATCH") {
          color = colors.cl_nomatch;
        } else if (d.data.state.name === "EMPTY") {
          color = colors.cl_empty;
        } else {
          color = colors.cl_active;
        }
        return circleStyle + "stroke: " + color + ";";
      })
      .attr("r", circle.radius);

  /* put the node symbol in each circle */
  var fontSize = Math.max((circle.radius - 2), 8);
  var fontSize2 = fontSize / 2;
  var symbolStyle = "text-anchor: middle;font-size: " + fontSize + "px; font-weight: bold;";
  nodeSelection.append("text")
      .attr("style", symbolStyle)
      .attr("dy", fontSize2)
      .text(function (d) {
        return d.data.op.name;
      });

  /* add a transparent circle on top to detect mouse events */
  nodeSelection.append("circle")
      .attr("opacity", 0)
      .attr("r", circle.radius - circle.strokeWidth)
      .on("click", toggle)
      .on("mouseout.fly", flyout)
      .on("mouseover.fly", flyover)
      .on("mouseover.ptr", setPointer)
      .on("mouseout.ptr", setDefault)
      .raise();
  function flyout(d) {
    if (d.data.isVisible) {
      tooltips.flyout(d);
    }
  }
  function flyover(d) {
    if (d.data.isVisible) {
      tooltips.flyover(d);
    }
  }
  function toggle(d) {
    if (d.data.isVisible) {
      if (d3.event.ctrlKey) {
        /* ctrl + click toggles tootip */
        toggleTooltip(d);
      } else {
        /* ctrl+click toggles phrase */
        togglePhrase(d);
      }
    }
  }
  /* toggle the phrase indicator on and off */
  function togglePhrase(d) {
    if (phrases.nodeData) {
      if (phrases.nodeData === d) {
        phrases.remove();
      } else {
        phrases.highlight(d);
      }
    } else {
      phrases.highlight(d);
    }
  }
  /* toggle the tool tip on and off */
  function toggleTooltip(d) {
    if (d.data.tooltip) {
      tooltips.tipoff(d);
    } else {
      tooltips.tipon(d);
    }
  }
  function setDefault(d) {
    if (d.data.isVisible) {
      d3.select(this).style("cursor", "default");
    }
  }
  function setPointer(d) {
    if (d.data.isVisible) {
      d3.select(this).style("cursor", "pointer");
    }
  }
};
