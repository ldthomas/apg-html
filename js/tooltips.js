// This module controls the construction, display and dragging of the tooltip rectangles.
module.exports = function (base, canvas) {
  "use strict";
  var tip = base.tooltip;
  var circle = base.circle;
  /* tipRect is global for convenience in connectorEndPoints() computation */
  var tipRect;

  /* add a flytip to this node */
  this.flyover = function (d) {
    if (d.data.tooltip || d.data.flytip) {
      return;
    }
    var g = d3.select("#node-" + d.data.id);
    g.raise();
    d.data.flytip = {};
    d.data.flytip.g = g;
    d.data.flytip.rect = g.append("rect");
    d.data.flytip.connector = g.append("path");
    d.data.flytip.text = g.append("text");
    tipRect = {};
    tipRect.top = d.data.id === 0 ? (tip.offset) : -(tip.height + tip.offset);
    tipRect.left = circle.radius + tip.offset;
    tipRect.height = tip.height;
    tipRect.width = 0;
    attachText(tipRect, d.data.flytip.text, opname(d.data));
    d.data.flytip.text.classed("fly-text", true);
    tipRect.width = g.select("text.fly-text").node().getComputedTextLength();
    tipRect.width += 2 * tip.offset;
    attachRect(tipRect, d.data.flytip.rect);
    attachConnector(tipRect, d.data.flytip.connector);
  };

  /* remove the info flytip & connector */
  this.flyout = function (d) {
    if (d.data.flytip) {
      d.data.flytip.connector.remove();
      d.data.flytip.rect.remove();
      d.data.flytip.text.remove();
      d.data.flytip = null;
    }
  };

  /* add a tooltip to this node */
  this.tipon = function (d) {
    if (d.data.tooltip) {
      return;
    }
    this.flyout(d);
    var g = d3.select("#node-" + d.data.id);
    g.raise();
    d.data.tooltip = {};
    d.data.tooltip.g = g;
    d.data.tooltip.rect = g.append("rect");
    d.data.tooltip.connector = g.append("path");
    d.data.tooltip.text = g.append("text");
    tipRect = {};
    tipRect.top = d.data.id === 0 ? (tip.offset) : -(tip.height + tip.offset);
    tipRect.left = circle.radius + tip.offset;
    tipRect.height = tip.height;
    tipRect.width = 0;
    attachText(tipRect, d.data.tooltip.text, opname(d.data));
    d.data.tooltip.text.classed("tip-text", true);
    tipRect.width = g.select("text.tip-text").node().getComputedTextLength();
    tipRect.width += 2 * tip.offset;
    attachRect(tipRect, d.data.tooltip.rect);
    attachConnector(tipRect, d.data.tooltip.connector);
  };

  /* remove the info tooltip & connector */
  this.tipoff = function (d) {
    if (d.data.tooltip) {
      d.data.tooltip.text.remove();
      d.data.tooltip.connector.remove();
      d.data.tooltip.rect.remove();
      d.data.tooltip = null;
    }
    ;
  };
  function attachRect(tipRect, rect) {
    rect.attr("x", tipRect.left);
    rect.attr("y", tipRect.top);
    rect.attr("width", tipRect.width);
    rect.attr("height", tipRect.height);
    rect.attr("rx", tip.cornerRadius);
    rect.attr("opacity", tip.opacity);
    rect.attr("stroke", tip.strokeColor);
    rect.attr("stroke-width", tip.strokeWidth + "px");
    rect.attr("fill", tip.fill);
    rect.on("mouseout", setDefault);
    rect.on("mouseover", setPointer);
    rect.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  }
  function attachText(tipRect, text, line) {
    var dx = tip.offset;
    var dy = 1.4 * tip.fontSize;
    text.attr("style", "font-family: sans-serif; font-size: " + tip.fontSize + "px;");
    text.attr("x", tipRect.left);
    text.attr("y", tipRect.top);
    text.attr("dx", dx);
    text.attr("dy", dy);
    text.text(line);
    text.on("mouseout", setDefault);
    text.on("mouseover", setPointer);
    text.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  }
  function attachConnector(tipRect, con) {
    var style = "fill: none; stroke: ";
    style += tip.strokeColor;
    style += "; stroke-width: ";
    style += tip.strokeWidth;
    style += "px;";
    con.attr("style", style);
    var endPoints = connectorEndPoints(tipRect);
    if (endPoints) {
      con.attr("opacity", 1);
      con.attr("d", canvas.linear(endPoints.to.x, endPoints.to.y, endPoints.from.x, endPoints.from.y));
    } else {
      con.attr("opacity", 0);
    }
  }
  ;
  function dragstarted(d) {
    var data = d.data.tooltip;
    data.mouseX = d3.event.x;
    data.mouseY = d3.event.y;
    data.rectX = parseInt(data.rect.attr("x"), 10);
    data.rectY = parseInt(data.rect.attr("y"), 10);
    data.g.raise();
    data.connector
        .attr("style", "fill: none; stroke: " + tip.dragStrokeColor + "; stroke-width: " + tip.dragStrokeWidth + "px;");
    data.rect
        .attr("opacity", 1)
        .attr("stroke-width", tip.dragStrokeWidth + "px")
        .attr("stroke", tip.dragStrokeColor);
  }
  ;

  function dragged(d) {
    var data = d.data.tooltip;
    tipRect.left = data.rectX + d3.event.x - data.mouseX;
    tipRect.top = data.rectY + d3.event.y - data.mouseY;
    var endPoints = connectorEndPoints(tipRect);
    if (endPoints) {
      data.connector.attr("opacity", 1);
      data.connector.attr("d", canvas.linear(endPoints.to.x, endPoints.to.y, endPoints.from.x, endPoints.from.y));
    } else {
      data.connector.attr("opacity", 0);
    }
    data.rect
        .attr("x", tipRect.left)
        .attr("y", tipRect.top);
    data.text.attr("x", tipRect.left);
    data.text.attr("y", tipRect.top);
  }
  function dragended(d) {
    var data = d.data.tooltip;
    data.connector.attr("style", "fill: none; stroke: " + tip.strokeColor + "; stroke-width: " + tip.strokeWidth + "px;");
    data.rect
        .attr("opacity", tip.opacity)
        .attr("stroke-width", tip.strokeWidth + "px")
        .attr("stroke", tip.strokeColor);
  }
  /* helper functions for attachConnector() */
  function setDefault() {
    d3.select(this).style("cursor", "default");
  }
  function setPointer() {
    d3.select(this).style("cursor", "move");
  }
  function connectorEndPoints(tipRect) {
    function isInRect(pt, rect) {
      var delta = .5;
      return ((pt.x >= (rect.left - delta)) && (pt.x <= (rect.right + delta)) && (pt.y <= (rect.bot + delta)) && (pt.y >= (rect.top - delta)));
    }
    ;
    if (isInRect({x: 0, y: 0}, tipRect)) {
      /* no connector if node center is in the tooltip rect */
      return null;
    }
    var rect = {
      top: tipRect.top,
      right: tipRect.left + tipRect.width,
      bot: tipRect.top + tipRect.height,
      left: tipRect.left
    };
    var tipCenter = {
      x: (rect.left + rect.right) / 2,
      y: (rect.top + rect.bot) / 2
    };
    var h = Math.sqrt(tipCenter.x * tipCenter.x + tipCenter.y * tipCenter.y);
    if (h <= circle.radius) {
      /* no connector if tooltip center is in the node circle */
      return null;
    }
    var sin = tipCenter.y / h;
    var cos = tipCenter.x / h;
    var from = {
      x: cos * circle.radius,
      y: sin * circle.radius
    };
    if (isInRect(from, rect)) {
      /* no connector if "from" endpoint is in the tooltip rect */
      return null;
    }
    var inter = {
      top: {
        x: 0,
        y: 0,
        h: 0
      },
      right: {
        x: 0,
        y: 0,
        h: 0
      },
      bot: {
        x: 0,
        y: 0,
        h: 0
      },
      left: {
        x: 0,
        y: 0,
        h: 0
      }
    };
    var to = {x: 0, y: 0};
    if (Math.abs(sin) < 0.01) {
      /* treat as on the x-axis */
      inter.left.x = rect.left;
      inter.left.h = inter.left.x / cos;
      inter.left.y = sin * inter.left.h;
      inter.right.x = rect.right;
      inter.right.h = inter.right.x / cos;
      inter.right.y = sin * inter.right.h;
      if (inter.left.h < inter.right.h) {
        to.x = inter.left.x;
        to.y = inter.left.y;
      } else {
        to.x = inter.right.x;
        to.y = inter.right.y;
      }
    } else if (Math.abs(cos) < 0.01) {
      /* treat as on the y-axis */
      inter.top.y = rect.top;
      inter.top.h = inter.top.y / sin;
      inter.top.x = cos * inter.top.h;
      inter.bot.y = rect.bot;
      inter.bot.h = inter.bot.y / sin;
      inter.bot.x = cos * inter.bot.h;
      if (inter.top.h < inter.bot.h) {
        to.x = inter.top.x;
        to.y = inter.top.y;
      } else {
        to.x = inter.bot.x;
        to.y = inter.bot.y;
      }
    } else {
      /* examine all four rect side intersections */
      inter.top.y = rect.top;
      inter.top.h = inter.top.y / sin;
      inter.top.x = cos * inter.top.h;
      inter.bot.y = rect.bot;
      inter.bot.h = inter.bot.y / sin;
      inter.bot.x = cos * inter.bot.h;
      inter.left.x = rect.left;
      inter.left.h = inter.left.x / cos;
      inter.left.y = sin * inter.left.h;
      inter.right.x = rect.right;
      inter.right.h = inter.right.x / cos;
      inter.right.y = sin * inter.right.h;
      var min = Infinity;
      var chosen = null;
      if (isInRect(inter.top, rect) && (inter.top.h < min)) {
        min = inter.top.h;
        chosen = inter.top;
      }
      if (isInRect(inter.right, rect) && (inter.right.h < min)) {
        min = inter.right.h;
        chosen = inter.right;
      }
      if (isInRect(inter.bot, rect) && (inter.bot.h < min)) {
        min = inter.bot.h;
        chosen = inter.bot;
      }
      if (isInRect(inter.left, rect) && (inter.left.h < min)) {
        min = inter.left.h;
        chosen = inter.left;
      }
      if (chosen === null) {
        throw new Error("tooltip can't find intersection");
      }
      to.x = chosen.x;
      to.y = chosen.y;
    }
    return {
      to: to,
      from: from
    };
  }

  /* tooltip operator name and definiton */
  function opname(data) {
    var ret;
    switch (data.op.name) {
      case "RNM":
        ret = "RNM (" + data.opData + ")";
        break;
      case "REP":
        ret = "REP " + range(data.opData[0], data.opData[1]);
        break;
      case "ALT":
        ret = "ALT";
        break;
      case "CAT":
        ret = "CAT";
        break;
      case "TLS":
        ret = "TLS \"" + charCodesToString(data.opData) + "\"";
        break;
      case "TBS":
        ret = "TBS '" + charCodesToString(data.opData) + "'";
        break;
      case "TRG":
        ret = "TRG " + range(data.opData[0], data.opData[1]);
        break;
      case "UDT":
        ret = "UDT (" + data.opData + ")";
        break;
      case "AND":
        ret = "AND";
        break;
      case "NOT":
        ret = "NOT";
        break;
      case "BKR":
        ret = "BKR (" + data.opData + ")";
        break;
      case "BKA":
        ret = "BKA";
        break;
      case "BKN":
        ret = "BKN";
        break;
      case "ABG":
        ret = "ABG";
        break;
      case "AEN":
        ret = "AEN";
        break;
      default:
        ret = "unknown";
        break;
    }
    return ret;
  }
  function range(min, max) {
    var ret = "[";
    ret += min;
    ret += " - ";
    ret += max === Infinity ? "\u221e" : max;
    ret += "]";
    return ret;
  }
  function charCodesToString(chars, index, length) {
    var txt = "";
    var beg = index ? index : 0;
    var end = length ? beg + length : chars.length;
    for (var i = beg; i < end; i += 1) {
      var char = chars[i];
      while (true) {
        if (char === 9) {
          txt += String.fromCharCode(0x2b7e);
          break;
        }
        if (char === 10) {
          txt += String.fromCharCode(0x21b5);
          break;
        }
        if (char === 13) {
          txt += String.fromCharCode(0x240d);
          break;
        }
        if (char === 32) {
          txt += String.fromCharCode(0x2423);
          break;
        }
        if (char >= 33 && char <= 126) {
          txt += String.fromCharCode(char);
          break;
        }
        txt += String.fromCharCode(0x08);
        break;
      }
    }
    return txt;
  }
};
