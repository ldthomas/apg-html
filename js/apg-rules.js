// Constuctor for the display and sorting of the rules/UDT information.
module.exports = function (global_data) {
  var G = global_data;
  var INDEX_DOWN = "index\u2193";
  var INDEX_UP = "index\u2191";
  var INDEX_NONE = "index&nbsp";
  var RULES_DOWN = "rule\u2193";
  var RULES_UP = "rule\u2191";
  var RULES_NONE = "rule&nbsp;";
  var ROW_SHOW = "show";
  var ROW_HIDE = "hide";
  var style = require('apg-lib').style;
  var _this = this;
  _this.rulesData = null;
  _this.udtsData = null;
  _this.msg = "";
  _this.dir = {
    index: INDEX_DOWN,
    rules: RULES_NONE
  };
  this.showAll = function (show) {
    setRowShow(show);
    return tableGen();
  };
  this.dependentsShow = function (event, index) {
    var rule = _this.rulesData.rows[index];
    rule.show = (event.currentTarget.innerHTML === ROW_SHOW);
    return tableGen();
  };
  this.sortIndex = function (event) {
    _this.dir.rules = RULES_NONE;
    function up(lhs, rhs) {
      return rhs.index - lhs.index;
    }
    function down(lhs, rhs) {
      return lhs.index - rhs.index;
    }
    if (event.currentTarget.innerHTML === INDEX_DOWN) {
      /* sort up */
      _this.rulesData.rows.sort(up);
      _this.udtsData.sort(up);
      _this.dir.index = INDEX_UP;
    } else {
      /* sort down */
      _this.rulesData.rows.sort(down);
      _this.udtsData.sort(down);
      _this.dir.index = INDEX_DOWN;
    }
    return tableGen();
  };
  this.sortName = function (event) {
    _this.dir.index = INDEX_NONE;
    function up(lhs, rhs) {
      if (lhs.lower > rhs.lower) {
        return -1;
      }
      if (lhs.lower < rhs.lower) {
        return 1;
      }
      return 0;
    }
    function down(lhs, rhs) {
      if (lhs.lower < rhs.lower) {
        return -1;
      }
      if (lhs.lower > rhs.lower) {
        return 1;
      }
      return 0;
    }
    if (event.currentTarget.innerHTML === RULES_DOWN) {
      /* sort up */
      _this.rulesData.rows.sort(up);
      _this.udtsData.sort(up);
      _this.dir.rules = RULES_UP;
    } else {
      /* sort down */
      _this.rulesData.rows.sort(down);
      _this.udtsData.sort(down);
      _this.dir.rules = RULES_DOWN;
    }
    return tableGen();
  };
  this.init = function (rules, udts, msg) {
    _this.rulesData = rules;
    _this.udtsData = udts;
    _this.msg = (msg && typeof (msg) === "string") ? msg : "";
    if (_this.rulesData !== null) {
      _this.dir.index = INDEX_DOWN;
      _this.dir.rules = RULES_NONE;
      setRowShow(true);
    }
    tableGen();
  };
  /* Generate the rules table HTML. */
  var tableGen = function () {
    if (_this.rulesData === null) {
      G.PAGE_INFO[G.RULES_PAGE].element.html(_this.msg);
      return false;
    }
    var html = "";
    html += '<table class="' + style.CLASS_RULES + '">';
    html += ' <caption>Rules</caption>';
    html += '<tr><th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.rules.sortIndex(event)">' + _this.dir.index
        + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.rules.sortName(event)">' + _this.dir.rules + '</a></th>';
    html += '<th>refers to</th></tr>';
    for (var i = 0; i < _this.rulesData.rows.length; i += 1) {
      var rule = _this.rulesData.rows[i];
      if (rule.dependents.length > 0) {
        var link = rule.show ? ROW_HIDE : ROW_SHOW;
        html += '<tr><td>' + rule.index + '</td><td>' + rule.name + '</td>';
        html += '<td><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.rules.dependentsShow(event,' + i + ')">' + link
            + '</a></td></tr>';
        if (rule.show) {
          for (var j = 0; j < rule.dependents.length; j += 1) {
            var obj = rule.dependents[j];
            html += '<tr><td></td><td>' + obj.index + '</td><td>' + obj.name + '</td></tr>';
          }
        }
      } else {
        html += '<tr><td>' + rule.index + '</td><td>' + rule.name + '</td><td></td></tr>';
      }
    }
    for (var i = 0; i < _this.udtsData.length; i += 1) {
      html += '<tr><td>' + _this.udtsData[i].index + '</td><td>' + _this.udtsData[i].name + '</td><td></td></tr>';
    }
    html += '</table>';
    G.PAGE_INFO[G.RULES_PAGE].element.html(html);
    return false;
  };
  function setRowShow(show) {
    if (_this.rulesData !== null) {
      _this.rulesData.rows.forEach(function (rule) {
        if (rule.dependents.length > 0) {
          for (var i = 0; i < rule.dependents.length; i += 1) {
            rule.show = show;
          }
        }
      });
    }
  }
  _this.init(null, null, "<h4>Rules not initialized.</h4>");
};
