// Constructor function for the generated parser.
module.exports = function (global_data) {
  var G = global_data;
  var TAB_PHRASES = 3;
  var TAB_STATE = 4;
  var DISPLAY_FIRST = 1;
  var DISPLAY_PREV = 2;
  var DISPLAY_ALL = 3;
  var DISPLAY_NEXT = 4;
  var DISPLAY_LAST = 5;
  var apglib = require("apg-lib");
  var converter = require("apg-conv-api").converter;
  var apgInput = require("./apg-input.js");
  var parser = null;
  var config = null;
  var rules = [];
  var selectedRule;
  var input = null;
  var grammar = null;
  var result = null;
  var startRule = 0;
  /* private functions */
  /* generate and open the full screen window */
  function iframeWrite(pageInfo, body) {
    var frame = pageInfo.element[0];
    var winHeight = frame.offsetHeight;
    var winWidth = frame.offsetWidth;
    var win = frame.contentWindow ? frame.contentWindow : frame.contentDocument;
    var doc = win.document;
    var lineHeight = 14;
    var fontSize = 12;
    var css = 'body{';
    css += 'color: black;';
    css += 'background-color: white;';
    css += 'font-family: monospace;';
    css += 'font-size: ' + fontSize + 'px;';
    css += 'line-height: ' + lineHeight + 'px;';
    css += 'margin: 3px;';
    css += 'width: 100%;}\n';
    css += apglib.emitcss();
    css += 'p{margin: 0;}';
    doc.open();
    doc.write('<html><head>');
    doc.write('<title>');
    doc.write(pageInfo.title);
    doc.write('</title>');
    doc.write('<style>');
    doc.write(css);
    doc.write('</style></head><body>');
    doc.write(body);
    doc.write('</body></html>');
    doc.close();
    var elPhrase = $('.apg-phrase', doc);
    if (elPhrase.length) {
      doc = $(doc);
      elPhrase = elPhrase.first();
      var top = doc.scrollTop();
      var left = doc.scrollLeft();
      var viewHeight = winHeight - (3 * lineHeight);
      viewHeight = viewHeight > 0 ? viewHeight : winHeight;
      var viewWidth = winWidth - (3 * fontSize);
      viewWidth = viewWidth > 0 ? viewWidth : winWidth;
      var bot = top + viewHeight;
      var right = left + viewWidth;
      var phraseTop = elPhrase.offset().top;
      var phraseLeft = elPhrase.offset().left;
      phraseTop = elPhrase.position().top;
      phraseLeft = elPhrase.position().left;
      if (phraseTop > bot || phraseTop < top) {
        doc.scrollTop(phraseTop);
      }
      if (phraseLeft > right || phraseLeft < left) {
        doc.scrollLeft(phraseLeft);
      }
    }
  }
  function ruleDropDown(obj) {
    function alpha(lhs, rhs) {
      if (lhs.lower < rhs.lower) {
        return -1;
      }
      if (lhs.lower > rhs.lower) {
        return 1;
      }
      return 0;
    }
    rules.length = 0;
    var list = $("#ast-phrases");
    if (!obj) {
      list.html("");
      return;
    }
    for (var key in obj) {
      var phrases = obj[key];
      var rule = {};
      rule.name = key;
      rule.lower = key.toLowerCase();
      rule.listName = key + '(' + phrases.length + ')';
      rule.selectedPhrase = 0;
      rule.phrases = [];
      for (var i = 0; i < phrases.length; i += 1) {
        var phrase = {};
        phrase.beg = phrases[i].index;
        phrase.end = phrases[i].index + phrases[i].length;
        rule.phrases.push(phrase);
      }
      rules.push(rule);
    }
    rules.sort(alpha);
    var html = '';
    html += '<option selected>' + rules[0].listName + '</option>';
    selectedRule = 0;
    for (var i = 1; i < rules.length; i += 1) {
      html += '<option>' + rules[i].listName + '</option>';
    }
    list.html(html);
  }
  function checkedValue(elements) {
    var ret = "off";
    elements.each(function (i) {
      var el = $(this);
      if (el.prop("checked")) {
        ret = el.prop("value");
      }
    });
    return ret;
  }
  // Initializes the generated parser.
  //````
  // src: is the the generated grammar text file, null if none
  // obj: is the constructed grammar object, null if none
  // msg: is the error message, displayed only of src & obj are null
  //````
  this.init = function (src, obj, msg) {
    G.PAGE_INFO[G.PARSER_AREA].element.val('No parser available.');
    G.PAGE_INFO[G.STATE_PAGE].element.html('<h4>No parser state available.</h4>');
    G.PAGE_INFO[G.STATS_PAGE].element.html('<h4>No parser statistics available.</h4>');
    iframeWrite(G.PAGE_INFO[G.TRACE_FRAME], '<h4>No parser trace available.</h4>');
    /* show/hide the trace config */
    var traceOnOff = checkedValue(G.TRACE.ON.elements);
    var cls = G.TRACE.TRACE_CONFIG.element.attr("class");
    cls = cls.replace(" show", "");
    cls = cls.replace(" hide", "");
    cls += (traceOnOff === "on") ? " show" : " hide";
    if (src && obj) {
      grammar = obj;
      G.PAGE_INFO[G.PARSER_AREA].element.val(src);
      function rulerows(rules, checked) {
        var cols = 5;
        var rows = rules.length;
        var remainder = rows % cols;
        var groups = (rows - remainder) / cols;
        var i = 0;
        var html = '';
        for (var j = 0; j < groups; j += 1) {
          html += "<tr>";
          for (var k = 0; k < cols; k += 1) {
            html += '<td><label><input type="checkbox" name="rules" value="' + rules[i].name + '" ' + checked + '> ' + rules[i].name + '</label></td>';
            i += 1;
          }
          html += "</tr>";
        }
        if (remainder > 0) {
          html += "<tr>";
          for (var k = 0; k < remainder; k += 1) {
            html += '<td><label><input type="checkbox" name="rules" value="' + rules[i].name + '" ' + checked + '> ' + rules[i].name + '</label></td>';
            i += 1;
          }
          html += "</tr>";
        }
        return html;
      }
      function alpha(lhs, rhs) {
        if (lhs.lower < rhs.lower) {
          return -1;
        }
        if (lhs.lower > rhs.lower) {
          return 1;
        }
        return 0;
      }
      /* initialize the config rules/UDT items */
      var checked = checkedValue(G.TRACE.RULES_ON.elements);
      checked = (checked === "on") ? "checked" : "";
      var list = grammar.rules.slice();
      list.sort(alpha);
      var html = rulerows(list, checked);
      list = grammar.udts.slice();
      list.sort(alpha);
      html += rulerows(list, checked);
      G.TRACE.RULES_TABLE.element.html(html);
      G.TRACE.RULES.elements = $("table#rules-table input");
      return;
    }
    if (msg && typeof (msg) === "string") {
      G.PAGE_INFO[G.PARSER_AREA].element.val(msg);
      grammar = null;
      return;
    }
  };
  this.setOperators = function (value) {
    var checked = (value === "on") ? true : false;
    G.TRACE.OPERATORS.elements.each(function () {
      $(this).prop("checked", checked);
    });
  };
  this.setRules = function (value) {
    var checked = (value === "on") ? true : false;
    G.TRACE.RULES.elements.each(function () {
      $(this).prop("checked", checked);
    });
  };
  this.traceOnOff = function (value) {
    var cls = G.TRACE.TRACE_CONFIG.element.prop("class");
    cls = cls.replace(" show", "");
    cls = cls.replace(" hide", "");
    cls += (value === "on") ? " show" : " hide";
    G.TRACE.TRACE_CONFIG.element.prop("class", cls);
  };
  this.openModal = function () {
    G.MODAL_INFO.elements[G.MODAL_DIALOG].css("display", "block");
    G.MODAL_INFO.elements[G.MODAL_TOP].html("Looks like your data is base 64.<br>Which data format does it represent?");
    var sel = "";
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'uint7\')">&#128903;</a> UINT7 (ASCII)<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'uint8\')">&#128903;</a> UINT8 (BINARY)<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'uint16be\')">&#128903;</a> UINT16BE<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'uint16le\')">&#128903;</a> UINT16LE<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'uint32be\')">&#128903;</a> UINT32BE<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'uint32le\')">&#128903;</a> UINT32LE<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'utf8\')">&#128903;</a> UTF-8<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'utf16\')">&#128903;</a> UTF-16<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'utf16be\')">&#128903;</a> UTF-16BE<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'utf16le\')">&#128903;</a> UTF-16LE<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'utf32\')">&#128903;</a> UTF-32<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'utf32be\')">&#128903;</a> UTF-32BE<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'utf32le\')">&#128903;</a> UTF-32LE<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'none\')">&#128903;</a> none - just parse it as is<br>';
    sel += '<a href="javascript:void(0)" onclick="apgHtml.parser.closeModal(\'cancel\')">&#128903; cancel</a>';
    G.MODAL_INFO.elements[G.MODAL_CONTENT].html(sel);
  };
  this.closeModal = function (format) {
    G.MODAL_INFO.elements[G.MODAL_DIALOG].css("display", "none");
    if (!format || format === "cancel") {
      return;
    }
    if (format === "none") {
      this.parseInput('ascii');
      return;
    }
    try {
      var type = "base64:" + format;
      var dst = converter.convert(type, G.PAGE_INFO[G.INPUT_AREA].element.val(), "ESCAPED");
      G.PAGE_INFO[G.INPUT_AREA].element.val(dst.toString("ascii"));
      this.parseInput('escaped');
    } catch (e) {
      var msg = '<p class="apg-error">Unable to perform requested base 64 conversion.</p>';
      msg += '<p>' + e.message + '</p>';
      iframeWrite(G.PAGE_INFO[G.PHRASES_FRAME], msg);
      this.openTab(TAB_PHRASES);
    }
  };
  this.parseInput = function (mode) {
    function getConfig() {
      var config = {};
      config.inputMode = checkedValue(G.INPUT_MODE.elements);
      config.trace = (checkedValue(G.TRACE.ON.elements) === "on");
      config.rules = {};
      if (config.trace) {
        config.traceMode = checkedValue(G.TRACE.DISPLAY.elements);
        config.traceRecords = {
          max: parseInt($("#trace-max-records").val(), 10),
          last: parseInt($("#trace-last-record").val(), 10)
        };
        if (isNaN(config.traceRecords.max) || config.traceRecords.max <= 0) {
          throw new Error("apgParser: configuration error: max trace records must be integer > 0");
        }
        if (isNaN(config.traceRecords.last)) {
          throw new Error("apgParser: configuration error: last trace record must be integer >= -1");
        }
        if (config.traceRecords.last <= 0) {
          config.traceRecords.last = -1;
        }
        config.operatorsOnOff = checkedValue(G.TRACE.OPERATORS_ON.elements);
        config.operators = {};
        G.TRACE.OPERATORS.elements.each(function () {
          var el = $(this);
          config.operators[el.val()] = el.prop("checked");
        });

        config.rulesOnOff = checkedValue(G.TRACE.RULES_ON.elements);
        G.TRACE.RULES.elements.each(function () {
          var el = $(this);
          config.rules[el.val()] = el.prop("checked");
        });
      }
      return config;
    }
    function isBase64(str) {
      function isChar(char) {
        if (char >= 65 && char <= 90) {
          return true;
        }
        if (char >= 97 && char <= 122) {
          return true;
        }
        if (char >= 48 && char <= 57) {
          return true;
        }
        if (char === 43) {
          return true;
        }
        if (char === 47) {
          return true;
        }
        return false;
      }
      var TAIL = 61;
      if (str.length >= 4) {
        for (var i = 0; i < str.length - 2; i += 1) {
          if (!isChar(str.charCodeAt(i))) {
            return false;
          }
        }
        var ct1 = str.charCodeAt(str.length - 2);
        var ct2 = str.charCodeAt(str.length - 1);
        if (isChar(ct1)) {
          if (isChar(ct2)) {
            return true;
          }
          if (ct2 === TAIL) {
            return true;
          }
        }
        if (ct1 === TAIL && ct2 === TAIL) {
          return true;
        }
      }
      return false;
    }
    function isEscaped(str) {
      for (var i = 0; i < str.length - 1; i += 1) {
        var ii = i + 1;
        if (str.charCodeAt(i) === 96) {
          if (str.charCodeAt(i) === 96) {
            return true;
          }
          if (str.charCodeAt(i) === 120) {
            return true;
          }
          if (str.charCodeAt(i) === 117) {
            return true;
          }
        }
      }
      return false;
    }
    rules.length = 0;
    input = null;
    try {
      /* validate the grammar */
      if (grammar === null) {
        throw new Error("apgParser: Parser has not been initialized.");
      }
      if (grammar.grammarObject !== "grammarObject") {
        throw new Error("apgParser: Parser object not recognized.");
      }
      if (grammar.udts.length > 0) {
        throw new Error("apgParser: Grammar has User Defined Terminals. Unable to parse input.");
      }
      /* read fixed config item values */
      config = getConfig();
      /* validate the input */
      var useMode = "auto";
      if (!mode || mode === "init") {
        useMode = config.inputMode;
      } else if (mode === "cancel") {
        return;
      } else {
        useMode = mode;
      }
      if (useMode === "auto") {
        if (isBase64(G.PAGE_INFO[G.INPUT_AREA].element.val())) {
          this.openModal();
          return;
        }
        if (isEscaped(G.PAGE_INFO[G.INPUT_AREA].element.val())) {
          useMode = "escaped";
        }
      }
      input = new apgInput(G.PAGE_INFO[G.INPUT_AREA].element.val(), useMode);
      if (input.invalidChars || input.invalidEscapes) {
        iframeWrite(G.PAGE_INFO[G.PHRASES_FRAME], input.displayInput());
        this.openTab(TAB_PHRASES);
        return;
      }

      /* set up the parser */
      parser = new apglib.parser();

      /* add statistics gathering */
      parser.stats = new apglib.stats();

      /* AST for display of matched phrases */
      parser.ast = new apglib.ast();

      /* configure trace, if any */
      if (config.trace) {
        parser.trace = new apglib.trace();
        for (var key in config.operators) {
          parser.trace.filter.operators[key] = config.operators[key];
        }
        for (var key in config.rules) {
          parser.trace.filter.rules[key] = config.rules[key];
        }
        parser.trace.setMaxRecords(config.traceRecords.max, config.traceRecords.last);
        for (var key in config.rules) {
          parser.ast.callbacks[key] = config.rules[key];
        }
      } else {
        grammar.rules.forEach(function (rule) {
          parser.ast.callbacks[rule.name] = true;
        });
      }

      /* configure AST for all rule/UDT names */
      startRule = 0;
      result = parser.parse(grammar, startRule, input.pchars);
      G.PAGE_INFO[G.STATE_PAGE].element.html(apglib.utils.parserResultToHtml(result, "Parser State"));
      G.PAGE_INFO[G.STATS_PAGE].element.html(parser.stats.toHtml("hits", "Parser Statistics"));
      if (config.trace) {
        iframeWrite(G.PAGE_INFO[G.TRACE_FRAME], parser.trace.toHtml(config.traceMode));
      }
      if (result.success) {
        /* populate phrase names */
        ruleDropDown(parser.ast.phrases());
        this.displayPhrase(null, 1);
        this.openTab(TAB_PHRASES);
      } else {
        ruleDropDown();
        iframeWrite(G.PAGE_INFO[G.PHRASES_FRAME], input.displayInput());
        this.openTab(TAB_STATE);
      }
    } catch (e) {
      var msg = '<span class="apg-error"><h4>Parser Exception:</h4>' + e.message;
      if (input !== null) {
        msg += "<br><br>";
        msg += input.displayInput();
      }
      iframeWrite(G.PAGE_INFO[G.PHRASES_FRAME], msg);
      this.openTab(TAB_PHRASES);
    }
  };
  /* use local storage to pass the trace object to the tree page */
  this.showTraceTree = function (target) {
    if (target) {
      target.blur();
    }
    if (config && config.trace) {
      var tree = parser.trace.toTree(true);
      if (tree.length > 0x400000) {
        throw new Error("JSON parse tree string too long: max: 0x400000: tree length: " + tree.length);
      }
      localStorage.setItem("displayMode", config.traceMode);
      localStorage.setItem("parseTree", tree);
      var win = window.open('./tree.html', '_blank').focus();
    }
  };
  this.phraseChange = function () {
    if (input === null || rules.length === 0) {
      return;
    }
    var selection = $("#ast-phrases option:selected");
    if (selection) {
      selectedRule = selection[0].index;
      rules[selectedRule].selectedPhrase = 0;
    }
    this.displayPhrase(null, DISPLAY_FIRST);
  };
  this.displayPhrase = function (target, type) {
    if (target) {
      target.blur();
    }
    if (input === null || rules.length === 0) {
      return;
    }
    var rule = rules[selectedRule];
    var phrases = [];
    switch (type) {
      case DISPLAY_FIRST:
        rule.selectedPhrase = 0;
        phrases[0] = rule.phrases[rule.selectedPhrase];
        break;
      case DISPLAY_PREV:
        if (rule.selectedPhrase > 0) {
          rule.selectedPhrase -= 1;
        }
        phrases[0] = rule.phrases[rule.selectedPhrase];
        break;
      case DISPLAY_NEXT:
        if (rule.phrases.length === 0) {
          rule.selectedPhrase = 0;
        } else if (rule.selectedPhrase < rule.phrases.length - 1) {
          rule.selectedPhrase += 1;
        }
        phrases[0] = rule.phrases[rule.selectedPhrase];
        break;
      case DISPLAY_LAST:
        rule.selectedPhrase = rule.phrases.length > 0 ? rule.phrases.length - 1 : 0;
        phrases[0] = rule.phrases[rule.selectedPhrase];
        break;
      default:
      case DISPLAY_ALL:
        rule.selectedPhrase = 0;
        phrases = rule.phrases.slice();
        break;
    }
    iframeWrite(G.PAGE_INFO[G.PHRASES_FRAME], input.displayPhrases(phrases));
  };
  this.openTab = function (tabnumber) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("parser-tabcontent");
    tablinks = document.getElementsByClassName("parser-tablinks");
    /* hide all content */
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].className = tabcontent[i].className.replace(" show", "");
      tabcontent[i].className = tabcontent[i].className.replace(" hide", "");
      tabcontent[i].className += " hide";
    }
    /* deactivate all menu links */
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    /* activate menu item (changes its color) */
    var tab = tablinks[tabnumber];
    if (tab) {
      tab.className += " active";
    }
    /* show the activated content */
    var content = tabcontent[tabnumber];
    if (content) {
      content.className = content.className.replace(" hide", "");
      content.className += " show";
    }
    return false;
  };
};
