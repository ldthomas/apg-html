// This module controls show/hide of the tree branches.
module.exports = function (svg, root, phrases) {
  var index;
  var duration = svg.duration;
  var branches = {
    nodes: [],
    links: [],
    leaf: []
  };
  function on(index, trans) {
    if (index >= 0 && index < len) {
      var l = branches.links[index];
      var n = branches.nodes[index];
      if (trans) {
        l.transition().duration(duration)
            .attrTween("opacity", function () {
              return d3.interpolateNumber(0, 1);
            });
        n.transition().duration(duration)
            .attrTween("opacity", function (d) {
              d.data.isVisible = true;
              return d3.interpolateNumber(0, 1);
            });
        phrases.highlight(branches.leaf[index]);
      } else {
        l.attr("opacity", 1.0);
        n.attr("opacity", function (d) {
          d.data.isVisible = true;
          return 1;
        });
      }
    }
  }
  function off(index, trans) {
    if (index >= 0 && index < len) {
      var l = branches.links[index];
      var n = branches.nodes[index];
      if (trans) {
        l.transition().duration(duration)
            .attrTween("opacity", function (d) {
              d.data.isVisible = false;
              return d3.interpolateNumber(1, 0);
            });
        n.transition().duration(duration)
            .attrTween("opacity", function () {
              return d3.interpolateNumber(1, 0);
            });
        if (index > 0) {
          phrases.highlight(branches.leaf[index - 1]);
        } else {
          phrases.remove();
        }
      } else {
        l.attr("opacity", 0);
        n.attr("opacity", function (d) {
          d.data.isVisible = false;
          return 0;
        });
      }
    }
  }
  this.begin = function () {
    /* hide all w/out transition */
    phrases.remove();
    for (var i = index - 1; i >= 0; i -= 1) {
      off(i, false);
    }
    index = 0;
    return index;
  };
  this.end = function () {
    phrases.remove();
    /* show all w/out transition */
    for (var i = index; i < len; i += 1) {
      on(i, false);
    }
    index = len;
    return index;
  };
  this.forward = function () {
    /* show next branch w/transition*/
    if (index < len) {
      on(index, true);
      index += 1;
    }
    return index;
  };
  this.back = function () {
    /* hide previous branch w/transition*/
    if (index > 0) {
      index -= 1;
      off(index, true);
    }
    return index;
  };
  
  this.goto = function (n) {
    if (n > index) {
      /* go forward to n */
      var to = Math.min(n, len);
      for (var i = index; i < to; i += 1) {
        on(i, false);
      }
      index = to;
    } else if (n < index) {
      /* go back to n */
      var to = Math.max(0, n);
      for (var i = index - 1; i >= to; i -= 1) {
        off(i, false);
      }
      index = to;
    }
  };
  /* constructor */
  var leaves = root.leaves();
  var len = leaves.length;
  for (var i = 1; i <= len; i += 1) {
    branches.links.push(svg.treeGroup.selectAll(".link.branch-" + i));
    branches.nodes.push(svg.treeGroup.selectAll(".node.branch-" + i));
    branches.leaf.push(leaves[i-1]);
  }
  index = 0;
  this.begin();
};
