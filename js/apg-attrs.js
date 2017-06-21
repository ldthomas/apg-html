// Constructor for the attributes object. Handles display and sorting of the rule attributes.
module.exports = function (global_data) {
  var G = global_data;
  var DOWN = 1;
  var UP = 2;
  var CHECKED_ID = "attr-errors-top";
  var COL_NAMES = [{
      DOWN: "index&darr;",
      UP: "index&uarr;",
      NONE: "index&nbsp;"
    }, {
      DOWN: "rule&darr;",
      UP: "rule&uarr;",
      NONE: "rule&nbsp;"
    }, {
      DOWN: "type&darr;",
      UP: "type&uarr;",
      NONE: "type&nbsp;"
    }, {
      DOWN: "left&darr;",
      UP: "left&uarr;",
      NONE: "left&nbsp;"
    }, {
      DOWN: "nested&darr;",
      UP: "nested&uarr;",
      NONE: "nested&nbsp;"
    }, {
      DOWN: "right&darr;",
      UP: "right&uarr;",
      NONE: "right&nbsp;"
    }, {
      DOWN: "cyclic&darr;",
      UP: "cyclic&uarr;",
      NONE: "cyclic&nbsp;"
    }, {
      DOWN: "finite&darr;",
      UP: "finite&uarr;",
      NONE: "finite&nbsp;"
    }, {
      DOWN: "empty&darr;",
      UP: "empty&uarr;",
      NONE: "empty&nbsp;"
    }, {
      DOWN: "not empty&darr;",
      UP: "not empty&uarr;",
      NONE: "not empty&nbsp;"
    }];
  var _this = this;
  _this.rulesData = null;
  _this.udtsData = null;
  _this.msg = noDataMsg;
  var style = require('apg-lib').style;
  var sortState = {};
  var colNames = [];
  var noDataMsg = "<h4>Attributes not initialized.</h4>";
  function sortIndex(sortDir, errors, others, udts) {
    function up(lhs, rhs) {
      return rhs.index - lhs.index;
    }
    function down(lhs, rhs) {
      return lhs.index - rhs.index;
    }
    if (sortDir === DOWN) {
      errors.sort(down);
      others.sort(down);
      udts.sort(down);
    } else {
      errors.sort(up);
      others.sort(up);
      udts.sort(up);
    }
  }
  function sortRules(sortDir, errors, others, udts) {
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
    if (sortDir === DOWN) {
      errors.sort(down);
      others.sort(down);
      udts.sort(down);
    } else {
      errors.sort(up);
      others.sort(up);
      udts.sort(up);
    }
  }
  function sortTypes(sortDir, errors, others, udts) {
    function up(lhs, rhs) {
      return rhs.type - lhs.type;
    }
    function down(lhs, rhs) {
      return lhs.type - rhs.type;
    }
    if (sortDir === DOWN) {
      errors.sort(down);
      others.sort(down);
      udts.sort(down);
    } else {
      errors.sort(up);
      others.sort(up);
      udts.sort(up);
    }
  }
  function sortAttrs(sortDir, errors, others, udts, col) {
    function up(lhs, rhs) {
      if ((lhs[col] === true) && (rhs[col] === false)) {
        return -1;
      }
      if ((lhs[col] === false) && (rhs[col] === true)) {
        return 1;
      }
      return 0;
    }
    function down(lhs, rhs) {
      if ((lhs[col] === true) && (rhs[col] === false)) {
        return 1;
      }
      if ((lhs[col] === false) && (rhs[col] === true)) {
        return -1;
      }
      return 0;
    }
    if (sortDir === DOWN) {
      errors.sort(down);
      others.sort(down);
      udts.sort(down);
    } else {
      errors.sort(up);
      others.sort(up);
      udts.sort(up);
    }
  }
  /* Generates and displays the attribute table. */
  var tableGen = function (errors, others) {
    function yes(val) {
      return val ? "yes" : "no";
    }
    function ruleGen(row) {
      var html = "";
      var left, cyclic, finite;
      var left = row.left ? '<span class="apg-error">' + yes(row.left) + '</span>' : yes(row.left);
      var cyclic = row.cyclic ? '<span class="apg-error">' + yes(row.cyclic) + '</span>' : yes(row.cyclic);
      var finite = row.finite ? yes(row.finite) : '<span class="apg-error">' + yes(row.finite) + '</span>';
      html += '<tr>';
      html += '<td>' + row.index + '</td>';
      html += '<td>' + row.name + '</td>';
      html += '<td>' + row.typename + '</td>';
      html += '<td>' + left + '</td>';
      html += '<td>' + yes(row.nested) + '</td>';
      html += '<td>' + yes(row.right) + '</td>';
      html += '<td>' + cyclic + '</td>';
      html += '<td>' + finite + '</td>';
      html += '<td>' + yes(row.empty) + '</td>';
      html += '<td>' + yes(row.notempty) + '</td>';
      html += '</tr>';
      return html;
    }
    var html = "";
    if (sortState.hasErrors) {
      var checked = sortState.topErrors ? "checked" : "";
      html += '<input type="checkbox" class="align-middle" id="' + CHECKED_ID + '" ' + checked + '> keep rules with attribute errors at top';
    }
    html += '<table class="' + style.CLASS_ATTRIBUTES + '">';
    html += ' <caption>Attributes</caption>';
    html += '<tr>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(0)">' + colNames[0] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(1)">' + colNames[1] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(2)">' + colNames[2] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(3)">' + colNames[3] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(4)">' + colNames[4] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(5)">' + colNames[5] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(6)">' + colNames[6] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(7)">' + colNames[7] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(8)">' + colNames[8] + '</a></th>';
    html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgHtml.attrs.sort(9)">' + colNames[9] + '</a></th>';
    html += '</tr>';
    errors.forEach(function (row) {
      html += ruleGen(row);
    });
    others.forEach(function (row) {
      html += ruleGen(row);
    });
    _this.udtsData.forEach(function (row) {
      html += ruleGen(row);
    });
    html += "</table>";
    return html;
  };
  /* Initializes the attributes table state data for a descending sort on the index column. */
  function initSort(col) {
    if (_this.rulesData === null) {
      return;
    }
    for (var i = 0; i < COL_NAMES.length; i += 1) {
      colNames[i] = COL_NAMES[i].NONE;
    }
    /* initialize to default sort state */
    sortState.hasErrors = false;
    for (var i = 0; i < _this.rulesData.length; i += 1) {
      if (_this.rulesData[i].error) {
        sortState.hasErrors = true;
        break;
      }
    }
    sortState.topErrors = true;
    sortState.col = 0;
    sortState.dir = UP;
    colNames[sortState.col] = COL_NAMES[sortState.col].UP;
  }
  /* Called by the parser generator to initialize the attributes table, if any. */
  /* Displays either the table or an error message on the attributes page. */
  this.init = function (rules, udts, msg) {
    _this.rulesData = rules;
    _this.udtsData = udts;
    if (msg && typeof (msg) === "string") {
      _this.msg = msg;
    } else if (_this.rulesData === null) {
      _this.msg = noDataMsg;
    } else {
      _this.msg = "";
    }
    initSort(0);
    _this.sort(0);
  };
  /* Event handler for the attribute table column header sorting anchors. */
  this.sort = function (col) {
    if (_this.rulesData === null) {
      G.PAGE_INFO[G.ATTRS_PAGE].element.html(_this.msg);
      return false;
    }
    var errorRules = [];
    var otherRules = [];
    for (var i = 0; i < COL_NAMES.length; i += 1) {
      colNames[i] = COL_NAMES[i].NONE;
    }
    var el = document.getElementById(CHECKED_ID);
    if (el !== null) {
      sortState.topErrors = el.checked;
    }
    if (col === sortState.col) {
      sortState.dir = sortState.dir === DOWN ? UP : DOWN;
    } else {
      sortState.col = col;
      sortState.dir = DOWN;
    }
    colNames[col] = sortState.dir === DOWN ? COL_NAMES[col].DOWN : COL_NAMES[col].UP;
    for (var i = 0; i < _this.rulesData.length; i += 1) {
      if (sortState.topErrors && _this.rulesData[i].error) {
        errorRules.push(_this.rulesData[i]);
      } else {
        otherRules.push(_this.rulesData[i]);
      }
    }
    switch (sortState.col) {
      case 0:
        sortIndex(sortState.dir, errorRules, otherRules, _this.udtsData);
        break;
      case 1:
        sortRules(sortState.dir, errorRules, otherRules, _this.udtsData);
        break;
      case 2:
        sortTypes(sortState.dir, errorRules, otherRules, _this.udtsData);
        break;
      case 3:
        sortAttrs(sortState.dir, errorRules, otherRules, _this.udtsData, "left");
        break;
      case 4:
        sortAttrs(sortState.dir, errorRules, otherRules, _this.udtsData, "nested");
        break;
      case 5:
        sortAttrs(sortState.dir, errorRules, otherRules, _this.udtsData, "right");
        break;
      case 6:
        sortAttrs(sortState.dir, errorRules, otherRules, _this.udtsData, "cyclic");
        break;
      case 7:
        sortAttrs(sortState.dir, errorRules, otherRules, _this.udtsData, "finite");
        break;
      case 8:
        sortAttrs(sortState.dir, errorRules, otherRules, _this.udtsData, "empty");
        break;
      case 9:
        sortAttrs(sortState.dir, errorRules, otherRules, _this.udtsData, "notempty");
        break;
    }
    G.PAGE_INFO[G.ATTRS_PAGE].element.html(tableGen(errorRules, otherRules, _this.udtsData));
    return false;
  };
  /* initialize the attributes page message */
  this.init(null, null);
};
