// This function generates the object with all of the event handlers for the web interface events.
window.$ = require("jquery");
window.apgHtml = (function () {
  var apgWeb = function () {
    var apiCtor = require("apg-api");
    var apgParser = require("./apg-parser.js");
    var apgAttrs = require("./apg-attrs.js");
    var apgRules = require("./apg-rules.js");
    /* Global HTML page information */
    var G = {
      GRAMMAR_AREA: 'grammar-area',
      PARSER_AREA: 'parser-area',
      INPUT_AREA: 'input-area',
      GRAMMAR_PAGE: 'grammar-page',
      RULES_PAGE: 'rules-page',
      ATTRS_PAGE: 'attrs-page',
      STATE_PAGE: 'state-page',
      STATS_PAGE: 'stats-page',
      TRACE_FRAME: 'trace-frame',
      PHRASES_FRAME: 'phrases-frame',
      MODAL_DIALOG: 'modal',
      MODAL_TOP: 'modal-top',
      MODAL_CONTENT: 'modal-content',
      MODAL_INFO: {},
      TYPE_TEXTAREA: 1,
      TYPE_PAGE: 2,
      TYPE_FRAME: 3,
      PAGE_INFO: [],
      INPUT_MODE: {
        name: 'input-mode',
        elements: null
      },
      TRACE: {}
    };
    G.MODAL_INFO.elements = [G.MODAL_DIALOG, G.MODAL_TOP, G.MODAL_CONTENT];
    G.TRACE.ON = {
      name: 'traceon',
      elements: null
    };
    G.TRACE.DISPLAY = {
      name: 'trace-display',
      elements: null
    };
    G.TRACE.RECORDS = {
      name: 'trace-records',
      elements: null
    };
    G.TRACE.OPERATORS_ON = {
      name: 'operatorson',
      elements: null
    };
    G.TRACE.OPERATORS = {
      name: 'operators',
      elements: null
    };
    G.TRACE.RULES_ON = {
      name: 'ruleson',
      elements: null
    };
    G.TRACE.RULES_TABLE = {
      name: 'rules-table',
      element: null
    };
    G.TRACE.RULES = {
      name: 'rules',
      elements: null
    };
    G.TRACE.TRACE_CONFIG = {
      name: 'trace-config',
      element: null
    };
    /* handle the main menu tabs */
    this.openTab = function (tabnumber) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      tablinks = document.getElementsByClassName("tablinks");
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
    /* handle the "copy" button */
    this.select = function (name) {
      var el = G.PAGE_INFO[name].element;
      if (el && G.PAGE_INFO[name].type === G.TYPE_TEXTAREA) {
        el.select();
        try {
          document.execCommand('copy');
          el.blur();
        } catch (e) {
          alert("please press Ctrl/Cmd+C to copy");
        }
      }
    };
    /* handle the "full screeen" button */
    this.fullScreen = function (target, name) {
      target.blur();
      var options = "";
      options += "width=" + screen.availWidth + ",height=" + screen.availHeight + "";
      options += ",top=0";
      options += ",left=0";
      options += ",location=no";
      options += ",menubar=no";
      options += ",scrollbars=yes";
      options += ",status=no";
      options += ",titlebar=no";
      options += ",toolbar=no";
      options += ",resizable=yes";
      var css = require('apg-lib').emitcss();
      var button = '<button style="color:black;background:#B3C1FF;" type="button" onclick="window.close()">Close</button>';
      var html = '';
      var el = G.PAGE_INFO[name].element;
      if (el) {
        html += '<html><head>';
        switch (G.PAGE_INFO[name].type) {
          case G.TYPE_TEXTAREA:
            html += '<title>';
            html += G.PAGE_INFO[name].title;
            html += '</title></head><body>';
            html += button;
            html += "<pre>";
            html += el.val();
            html += "</pre>";
            html += button;
            break;
          case G.TYPE_PAGE:
            html += '<title>';
            html += G.PAGE_INFO[name].title;
            html += '</title></head><body>';
            html += '<style>' + css + '</style>';
            html += '</head><body>';
            html += button;
            html += el.html();
            html += '<br>';
            html += button;
            break;
          case G.TYPE_FRAME:
            var frame = G.PAGE_INFO[name].element[0];
            var win = frame.contentWindow ? frame.contentWindow : frame.contentDocument;
            html += win.document.head.innerHTML;
            html += '</head><body>';
            html += button;
            html += '<br>';
            html += win.document.body.innerHTML;
            html += '<br>';
            html += button;
            break;
        };
        html += '</body></html>';
        window.open("", "", options).document.write(html);
      }
      return false;
    };
    /* generate the parser (grammar object) for the input grammar */
    this.generate = function () {
      var attrsObj;
      var strict = false;
      var sabnfGrammar = G.PAGE_INFO[G.GRAMMAR_AREA].element.val();
      var grammarHtml = "";
      var rulesErrorMsg = "<h4>Rules not generated due to grammar errors.</h4>";
      var attrsErrorMsg = "<h4>Attributes not generated due to grammar errors.</h4>";
      var parserErrorMsg = "Parser not generated due to grammar errors.";
      var attrErrors = false;
      var validGrammar = false;
      while (true) {
        /* validate the input SABNF grammar */
        if (!sabnfGrammar || sabnfGrammar === "") {
          grammarHtml = '<h4 class="error">Input SABNF grammar is empty.</h4>';
          break;
        }
        var api = new apiCtor(sabnfGrammar);
        api.scan();
        grammarHtml = api.linesToHtml();
        if (api.errors.length) {
          grammarHtml += api.errorsToHtml("SABNF grammar has invalid characters");
          break;
        }
        /* validate the SABNF grammar syntax */
        api.parse();
        if (api.errors.length) {
          grammarHtml += api.errorsToHtml("SABNF grammar has syntax errors");
          break;
        }
        /* validate the SABNF grammar semantics */
        api.translate();
        if (api.errors.length) {
          grammarHtml += api.errorsToHtml("SABNF grammar has semantic errors");
          break;
        }
        /* validate the SABNF grammar attributes */
        attrsObj = api.getAttributesObject();
        api.attributes();
        if (api.errors.length) {
          grammarHtml += api.errorsToHtml("SABNF grammar has attribute errors");
          attrErrors = true;
          break;
        }
        /* success: have a valid grammar */
        validGrammar = true;
        break;
      }
      /* display the results */
      G.PAGE_INFO[G.GRAMMAR_PAGE].element.html(grammarHtml);
      /* Initialize the parser object. */
      if (validGrammar) {
        var src = api.toSource("generatedGrammar");
        var obj = api.toObject();
        this.parser.init(src, obj);
      } else {
        this.parser.init(null, null, parserErrorMsg);
      }
      /* Initialize the rules and attributes objects. */
      /* Having attrsObj implies having result.udt */
      if (attrsObj) {
        this.rules.init(attrsObj.rulesWithReferencesData(), api.udts);
        this.attrs.init(attrsObj.ruleAttrsData(), attrsObj.udtAttrsData());
      } else {
        this.rules.init(null, null, rulesErrorMsg);
        this.attrs.init(null, null, attrsErrorMsg);
      }
      /* Open the proper tab to display the appropriate results. */
      /* - the grammar tab if the grammar is invalid */
      /* - the attributes tab if there are attribute errors */
      /* - the parser tab if the grammar is valid */
      /* - always initialize the parser page to the Parser tab (even if the parser page is not displayed) */
      this.parser.openTab(0);
      if (attrErrors) {
        this.openTab(3);
      } else if (!validGrammar) {
        this.openTab(1);
      } else {
        this.openTab(4);
      }
    };
    /* set everything up after the DOM has loaded */
    this.onPageLoad = function () {
      G.PAGE_INFO[G.GRAMMAR_AREA] = {
        id: G.GRAMMAR_AREA,
        type: G.TYPE_TEXTAREA,
        title: 'input SABNF grammar',
        element: $("#" + G.GRAMMAR_AREA)
      };
      G.PAGE_INFO[G.PARSER_AREA] = {
        id: G.PARSER_AREA,
        type: G.TYPE_TEXTAREA,
        title: 'Generated Parser',
        element: $("#" + G.PARSER_AREA)
      };
      G.PAGE_INFO[G.INPUT_AREA] = {
        id: G.INPUT_AREA,
        type: G.TYPE_TEXTAREA,
        title: 'Input String',
        element: $("#" + G.INPUT_AREA)
      };
      G.PAGE_INFO[G.PHRASES_FRAME] = {
        id: G.PHRASES_FRAME,
        type: G.TYPE_FRAME,
        title: 'Annotated Phrases',
        element: $("#" + G.PHRASES_FRAME)
      };
      G.PAGE_INFO[G.GRAMMAR_PAGE] = {
        id: G.GRAMMAR_PAGE,
        type: G.TYPE_PAGE,
        title: '',
        element: $("#" + G.GRAMMAR_PAGE)
      };
      G.PAGE_INFO[G.RULES_PAGE] = {
        id: G.RULES_PAGE,
        type: G.TYPE_PAGE,
        title: '',
        element: $("#" + G.RULES_PAGE)
      };
      G.PAGE_INFO[G.ATTRS_PAGE] = {
        id: G.ATTRS_PAGE,
        type: G.TYPE_PAGE,
        title: '',
        element: $("#" + G.ATTRS_PAGE)
      };
      G.PAGE_INFO[G.STATE_PAGE] = {
        id: G.STATE_PAGE,
        type: G.TYPE_PAGE,
        title: '',
        element: $("#" + G.STATE_PAGE)
      };
      G.PAGE_INFO[G.STATS_PAGE] = {
        id: G.STATS_PAGE,
        type: G.TYPE_PAGE,
        title: '',
        element: $("#" + G.STATS_PAGE)
      };
      G.PAGE_INFO[G.TRACE_FRAME] = {
        id: G.TRACE_FRAME,
        type: G.TYPE_FRAME,
        title: 'Parser Trace',
        element: $("#" + G.TRACE_FRAME)
      };
      G.MODAL_INFO.elements[G.MODAL_DIALOG] = $("#" + G.MODAL_DIALOG);
      G.MODAL_INFO.elements[G.MODAL_TOP] = $("#" + G.MODAL_TOP);
      G.MODAL_INFO.elements[G.MODAL_CONTENT] = $("#" + G.MODAL_CONTENT);
      G.INPUT_MODE.elements = $('[name="' + G.INPUT_MODE.name + '"]');
      G.TRACE.ON.elements = $('[name="' + G.TRACE.ON.name + '"]');
      G.TRACE.DISPLAY.elements = $('[name="' + G.TRACE.DISPLAY.name + '"]');
      G.TRACE.RECORDS.elements = $('[name="' + G.TRACE.RECORDS.name + '"]');
      G.TRACE.OPERATORS_ON.elements = $('[name="' + G.TRACE.OPERATORS_ON.name + '"]');
      G.TRACE.OPERATORS.elements = $('[name="' + G.TRACE.OPERATORS.name + '"]');
      G.TRACE.RULES_ON.elements = $('[name="' + G.TRACE.RULES_ON.name + '"]');
      G.TRACE.RULES_TABLE.element = $("#" + G.TRACE.RULES_TABLE.name);
      G.TRACE.TRACE_CONFIG.element = $("#" + G.TRACE.TRACE_CONFIG.name);
      var height = (Math.floor(($(window).height()) - 400) * .9);
      G.PAGE_INFO[G.GRAMMAR_AREA].element.height(height);
      G.PAGE_INFO[G.PARSER_AREA].element.height(height);
      G.PAGE_INFO[G.INPUT_AREA].element.height(height);
      G.PAGE_INFO[G.PHRASES_FRAME].element.height(height);
      G.PAGE_INFO[G.TRACE_FRAME].element.height(height);
      /* instantiate the helper objects */
      this.rules = new apgRules(G);
      this.attrs = new apgAttrs(G);
      this.parser = new apgParser(G);
      this.parser.init(null, null, "Parser not initialized.", null);
      this.parser.openTab(0);
      this.openTab(0);
      G.PAGE_INFO[G.GRAMMAR_PAGE].element.html("<h4>Grammar not parsered.</h4>");
      /* set the event handlers */
      $("#header .tablinks").each(function (index) {
        $(this).click(function () {
          apgHtml.openTab(index);
        });
      });
      $("#generate").click(function () {
        apgHtml.generate();
      });
      $("#generate-select").click(function () {
        apgHtml.select(G.GRAMMAR_AREA);
      });
      $("#generate-full").click(function () {
        apgHtml.fullScreen(this, G.GRAMMAR_AREA);
      });
      $("#grammar-full").click(function () {
        apgHtml.fullScreen(this, G.GRAMMAR_PAGE);
      });
      $("#rules-show").click(function () {
        apgHtml.rules.showAll(true);
      });
      $("#rules-hide").click(function () {
        apgHtml.rules.showAll(false);
      });
      $("#rules-full").click(function () {
        apgHtml.fullScreen(this, G.RULES_PAGE);
      });
      $("#attrs-full").click(function () {
        apgHtml.fullScreen(this, G.ATTRS_PAGE);
      });
      $("#parser-tabs a").each(function (index) {
        $(this).click(function () {
          apgHtml.parser.openTab(index);
        });
      });
      $("#parser-copy").click(function () {
        apgHtml.select(G.PARSER_AREA);
      });
      $("#parser-full").click(function () {
        apgHtml.fullScreen(this, G.PARSER_AREA);
      });
      $("#input-parse").click(function () {
        apgHtml.parser.parseInput("init");
      });
      $("#input-parse-copy").click(function () {
        apgHtml.select(G.INPUT_AREA);
      });
      $("#input-parse-full").click(function () {
        apgHtml.fullScreen(this, G.INPUT_AREA);
      });
      $("#input-area").dblclick(function () {
        apgHtml.parser.openModal();
      });
      $("#modal-close").click(function () {
        apgHtml.parser.closeModal("cancel");
      });
      G.TRACE.ON.elements.each(function () {
        $(this).click(function () {
          apgHtml.parser.traceOnOff($(this).prop("value"));
        });
      });
      G.TRACE.RULES_ON.elements.each(function () {
        $(this).click(function () {
          apgHtml.parser.setRules($(this).prop("value"));
        });
      });
      G.TRACE.OPERATORS_ON.elements.each(function () {
        $(this).click(function () {
          apgHtml.parser.setOperators($(this).prop("value"));
        });
      });
      $("#ast-phrases").on("change", function () {
        apgHtml.parser.phraseChange();
      });
      $("#ast-phrases-1").click(function () {
        apgHtml.parser.displayPhrase(this, 1);
      });
      $("#ast-phrases-2").click(function () {
        apgHtml.parser.displayPhrase(this, 2);
      });
      $("#ast-phrases-3").click(function () {
        apgHtml.parser.displayPhrase(this, 3);
      });
      $("#ast-phrases-4").click(function () {
        apgHtml.parser.displayPhrase(this, 4);
      });
      $("#ast-phrases-5").click(function () {
        apgHtml.parser.displayPhrase(this, 5);
      });
      $("#ast-phrases-full").click(function () {
        apgHtml.fullScreen(this, G.PHRASES_FRAME);
      });
      $("#state-full").click(function () {
        apgHtml.fullScreen(this, G.STATE_PAGE);
      });
      $("#stats-full").click(function () {
        apgHtml.fullScreen(this, G.STATS_PAGE);
      });
      $("#trace-full").click(function () {
        apgHtml.fullScreen(this, G.TRACE_FRAME);
      });
      $("#trace-tree").click(function () {
        apgHtml.parser.showTraceTree(this);
      });
    };
  };
  return new apgWeb();
})();
