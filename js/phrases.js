// This module handles the highlighting of the phrases that belong to the individual nodes.
module.exports = function (base, svg) {
  "use strict";
  var colors = base.colors;
  var chars = svg.textString.displayChars;
  var duration = svg.duration;
  var calledNode = null;
  var phraseRect = null;
  var phraseBeg = null;
  var phraseEnd = null;
  var specialChar = null;
  this.remove = function () {
    /* just remove the existing phrase, if any, and quit */
    if (calledNode) {
      removePhrase();
      calledNode = null;
    }
  };
  this.highlight = function (d) {
    if (calledNode) {
      if (calledNode === d) {
        /* this phrase is already highlighted */
        this.remove();
        return;
      }
      /* remove the current phrase and .on("end"), highlight the requested phrase */
      calledNode = d;
      removePhrase(true, d);
    } else {
      /* no previous phrase, just highlight a new one */
      calledNode = d;
      highlightPhrase();
    }
  };
  var removePhrase = function (highlight) {
    if (phraseRect) {
      phraseRect
          .transition()
          .duration(duration)
          .attrTween("opacity", function () {
            return d3.interpolateNumber(1, 0);
          })
          .remove();
      phraseRect = null;
      svg.textElement.selectAll("tspan")
          .transition()
          .duration(duration)
          .styleTween("fill", function () {
            return d3.interpolateRgb(getComputedStyle(this).getPropertyValue("fill"), colors.cl_normal);
          });
    }
    if (phraseEnd) {
      phraseEnd
          .transition()
          .duration(duration)
          .attrTween("opacity", function () {
            return d3.interpolateNumber(.5, 0);
          })
          .remove();
      phraseEnd = null;
    }
    if (phraseBeg) {
      /* note: if any phrase is highlighted, there will always be a beginning connector */
      /* whereas, there may or may not be any of the other hightlight elements */
      if (highlight) {
        phraseBeg
            .transition()
            .duration(duration)
            .attrTween("opacity", function () {
              return d3.interpolateNumber(.5, 0);
            })
            .on("end", highlightPhrase)
            .remove();
      } else {
        phraseBeg
            .transition()
            .duration(duration)
            .attrTween("opacity", function () {
              return d3.interpolateNumber(.5, 0);
            })
            .remove();
      }
      phraseBeg = null;
      if (specialChar) {
        specialChar
            .transition()
            .duration(duration)
            .attrTween("opacity", function () {
              return d3.interpolateNumber(.5, 0);
            })
            .remove();
        specialChar = null;
      }
    }
  };
  var highlightPhrase = function () {
    if (calledNode) {
      var index, length, textChar, textColor;
      var fromx = calledNode.x + svg.treeRect.left;
      var fromy = calledNode.y + base.circle.radius + svg.treeRect.top;
      if (calledNode.data.phrase === null) {
        index = 0;
        length = 0;
      } else {
        index = calledNode.data.phrase.index;
        length = calledNode.data.phrase.length;
      }
      if (calledNode.data.state.name === "NOMATCH") {
        /* NOMATCH condition, display x */
        textChar = "\u2718";
        textColor = colors.cl_nomatch;
      } else if (calledNode.data.state.name === "ACTIVE") {
        /* EMPTY condition, display epsilon */
        textChar = "?";
        textColor = colors.cl_active;
      } else if (calledNode.data.state.name === "EMPTY") {
        /* EMPTY condition, display epsilon */
        textChar = "\u{1d73a}";
        textColor = colors.cl_empty;
      } else if (calledNode.data.state.name === "MATCH") {
        /* MATCH condition, highlight phrase */
        if (index >= chars.length) {
          /* report this error, should never happen*/
          throw new Error(__filename + ": hightlightPhrase(): phrase index > string length")
        }
        var beg = chars[index];
        var end = chars[index + length - 1];
        var rectbeg = svg.textString.left + beg.beg;
        var recttop = svg.textString.top - svg.textString.fontSize + 2;
        var rectend = svg.textString.left + end.end;
        var textbeg = rectbeg + svg.textRect.left;
        var textend = rectend + svg.textRect.left;
        var texttop = recttop + svg.textRect.top;
        phraseRect = svg.textGroup
            .append("rect")
            .attr("x", rectbeg)
            .attr("y", recttop)
            .attr("width", rectend - rectbeg)
            .attr("height", svg.textString.fontSize)
            .attr("stroke", colors.cl_match)
            .attr("stroke-width", "1px")
            .attr("opacity", 0)
            .attr("fill", "none");
        phraseRect.transition()
            .duration(duration)
            .attrTween("opacity", function () {
              return d3.interpolateNumber(0, 1);
            });
        phraseBeg = svg.outerGroup
            .append("path")
            .attr("d", svg.cubicBezier(textbeg, texttop, fromx, fromy))
            .attr("stroke", colors.solor_lightgray)
            .attr("stroke-width", "1px")
            .attr("fill", "none")
            .attr("opacity", 0);
        phraseBeg.transition().duration(duration)
            .attrTween("opacity", function () {
              return d3.interpolateNumber(0, .5);
            });
        phraseEnd = svg.outerGroup
            .append("path")
            .attr("d", svg.cubicBezier(textend, texttop, fromx, fromy))
            .attr("stroke", colors.solor_lightgray)
            .attr("stroke-width", "1px")
            .attr("fill", "none")
            .attr("opacity", 0);
        phraseEnd
            .transition()
            .duration(duration)
            .attrTween("opacity", function () {
              return d3.interpolateNumber(0, .5);
            });
        svg.textElement.selectAll("tspan")
            .transition()
            .duration(duration)
            .styleTween("fill", function (d, i) {
              if (i < index) {
                return d3.interpolateRgb(getComputedStyle(this).getPropertyValue("fill"), colors.cl_prefix);
              }
              if (i >= index && i < index + length) {
                return d3.interpolateRgb(getComputedStyle(this).getPropertyValue("fill"), colors.cl_phrase);
              }
              return d3.interpolateRgb(getComputedStyle(this).getPropertyValue("fill"), colors.cl_suffix);
            });
        return;
      }

      var beg = svg.textString.left + svg.textRect.left;
      if (index >= chars.length) {
        var ix = Math.max(0, chars.length - 1);
        beg += chars[ix].end;
      } else {
        beg += chars[index].beg;
      }
      var top = svg.textString.top + svg.textRect.top;
      phraseBeg = svg.outerGroup
          .append("path")
          .attr("d", svg.cubicBezier(beg, top, fromx, fromy))
          .attr("stroke", colors.solor_lightgray)
          .attr("stroke-width", "1px")
          .attr("fill", "none")
          .attr("opacity", 0);
      phraseBeg.transition().duration(duration)
          .attrTween("opacity", function () {
            return d3.interpolateNumber(0, .5);
          });
      specialChar = svg.outerGroup
          .append("text")
          .text(textChar)
          .attr("fill", textColor)
          .attr("x", beg)
          .attr("y", top - svg.textString.fontSize / 2)
          .attr("opacity", 0);
      specialChar.transition().duration(duration)
          .attrTween("opacity", function () {
            return d3.interpolateNumber(0, 1);
          });
    }
  };
};
