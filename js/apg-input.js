// Constructor for the object which processes the input to a generated parser.
// It takes the input string from the parser input area, performs validation
// checks and, if no errors, produces an array of characters for the parser to parse.
//````
// input: the input string
// mode: if "escaped", input is decoded from escaped format
//       otherwise, input is treated as pure ASCII.
//````
module.exports = function (input, mode) {
  var apglib = require("apg-lib");
  var strings = [];
  var pmap = [];
  /* private functions */
  function ctrlChars(str) {
    exp = /(\r\n)|(\n)|(\r)|(\t)/g;
    var out = "";
    var beg = 0;
    exp.lastIndex = 0;
    while ((rx = exp.exec(str)) !== null) {
      if (beg < rx.index) {
        out += str.slice(beg, rx.index);
      }
      if (rx[1]) {
        out += '<span class="apg-ctrl-char">CRLF</span><br>';
      } else if (rx[2]) {
        out += '<span class="apg-ctrl-char">LF</span><br>';
      } else if (rx[3]) {
        out += '<span class="apg-ctrl-char">CR</span><br>';
      } else if (rx[4]) {
        out += '<span class="apg-ctrl-char">TAB</span>';
      }
      beg = rx.index + rx[0].length;
    }
    if (beg < str.length) {
      out += str.slice(beg);
    }
    return out;
  }
  function findInvalidChars(str) {
    function validRange(beg, end, chars, display) {
      display.push(ctrlChars(str.slice(beg, end)));
    }
    function invalidRange(beg, end, chars, display) {
      var str = '<span class="apg-error">\\x' + chars[beg].toString(16);
      for (var i = beg + 1; i < end; i += 1) {
        str += '\\x' + chars[i].toString(16);
      }
      str += '</span>';
      display.push(str);
    }
    var exp = /[ -~\t\r\n]+/g;
    var rx = exp.exec(str);
    if (rx === null) {
      /* entire string is invalid characters */
      var chars = apglib.utils.stringToChars(str);
      var display = [];
      invalidRange(0, str.length, chars, display);
      return false;
    }
    if (rx[0].length === str.length) {
      /* entire string is valid */
      return [];
    }
    var chars = apglib.utils.stringToChars(str);
    var display = [];
    var beg = 0;
    while (rx !== null) {
      if (beg < rx.index) {
        invalidRange(beg, rx.index, chars, display);
      }
      validRange(rx.index, rx.index + rx[0].length, chars, display);
      beg = exp.lastIndex;
      if (exp.lastIndex === 0) {
        break;
      }
      rx = exp.exec(str);
    }
    if (beg < str.length) {
      invalidRange(beg, str.length, chars, display);
    }
    return display;
  }
  function findInvalidEscapes(escapedStr, originalStr) {
    function validRange(beg, end, display) {
      display.push(ctrlChars(originalStr.slice(beg, end)));
    }
    function invalidRange(display) {
      display.push('<span class="apg-error">`</span>');
    }
    var display = [];
    var exp = /`/g;
    var rx = exp.exec(escapedStr);
    if (rx === null) {
      /* no invalid escapes */
      return [];
    }
    var chars = apglib.utils.stringToChars(escapedStr);
    var display = [];
    var beg = 0;
    while (rx !== null) {
      if (beg < rx.index) {
        validRange(beg, rx.index, chars, display);
      }
      invalidRange(rx.index, rx.index + rx[0].length, chars, display);
      beg = exp.lastIndex;
      if (exp.lastIndex === 0) {
        break;
      }
      rx = exp.exec(escapedStr);
    }
    if (beg < escapedStr.length) {
      validRange(beg, escapedStr.length, chars, display);
    }
    return display;
  }
  function markupEscapes(str) {
    var expd = /``/g;
    var expx = /`x[0-9a-fA-F]{2}/g;
    var expu = /`u[0-9a-fA-F]{4}/g;
    var expuu = /`u\{[0-9a-fA-F]{5,8}\}/g;
    var ret = str.replace(expd, '\x01\x01');
    ret = ret.replace(expx, function (match) {
      return match.replace('`x', '\x02\x02');
    });
    ret = ret.replace(expu, function (match) {
      return match.replace('`u', '\x03\x03');
    });
    ret = ret.replace(expuu, function (match) {
      return match.replace('`u', '\x04' + String.fromCharCode(match.length - 4));
    });
    return ret;
  }
  function translateEscapes(str, pchars, pmap) {
    var tmp, ii;
    var chars = apglib.utils.stringToChars(str);
    var pi = 0;
    var i = 0;
    pchars.length = 0;
    pmap.length = 0;
    while (true) {
      var char = chars[i];
      switch (char) {
        case 1:
          ii = i + 2;
          pchars[pi] = 96;
          pmap[pi] = '`';
          chars[i] = 96;
          chars[i + 1] = 96;
          break;
        case 2:
          ii = i + 4;
          tmp = str.slice(i + 2, ii);
          pchars[pi] = parseInt(tmp, 16);
          pmap[pi] = '`x' + tmp;
          chars[i] = 96;
          chars[i + 1] = 120;
          break;
        case 3:
          ii = i + 6;
          tmp = str.slice(i + 2, ii);
          pchars[pi] = parseInt(tmp, 16);
          pmap[pi] = '`u' + tmp;
          chars[i] = 96;
          chars[i + 1] = 88;
          break;
        case 4:
          ii = i + chars[i + 1] + 4;
          tmp = str.slice(i + 3, i + 3 + chars[i + 1]);
          pchars[pi] = parseInt(tmp, 16);
          pmap[pi] = '`u{' + tmp + "}";
          chars[i] = 96;
          chars[i + 1] = 88;
          break;
        case 9:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">TAB</span>';
          break;
        case 10:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">LF</span><br>';
          break;
        case 13:
          ii = i + 1;
          if (ii < chars.length && chars[ii] === 10) {
            pchars[pi] = 13;
            pchars[pi + 1] = 10;
            pmap[pi] = '<span class="apg-ctrl-char">CR</span>';
            pmap[pi + 1] = '<span class="apg-ctrl-char">LF</span><br>';
            ii += 1;
            pi += 1;
          } else {
            pchars[pi] = char;
            pmap[pi] = '<span class="apg-ctrl-char">CR</span><br>';
          }
          break;
        case 32:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&nbsp;';
          break;
        case 38:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&amp;';
          break;
        case 60:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&lt;';
          break;
        default:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = String.fromCharCode(char);
          break;
      }
      i = ii;
      pi += 1;
      if (i >= chars.length) {
        break;
      }
    }
    return chars;
  }
  function translateCtrl(str, pchars, pmap) {
    var tmp, ii;
    var chars = apglib.utils.stringToChars(str);
    var pi = 0;
    var i = 0;
    pchars.length = 0;
    pmap.length = 0;
    while (true) {
      var char = chars[i];
      switch (char) {
        case 9:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">TAB</span>';
          break;
        case 10:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">LF</span><br>';
          break;
        case 13:
          ii = i + 1;
          if (ii < chars.length && chars[ii] === 10) {
            pchars[pi] = 13;
            pchars[pi + 1] = 10;
            pmap[pi] = '<span class="apg-ctrl-char">CR</span>';
            pmap[pi + 1] = '<span class="apg-ctrl-char">LF</span><br>';
            ii += 1;
            pi += 1;
          } else {
            pchars[pi] = char;
            pmap[pi] = '<span class="apg-ctrl-char">CR</span><br>';
          }
          break;
        case 32:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&nbsp;';
          break;
        case 38:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&amp;';
          break;
        case 60:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&lt;';
          break;
        default:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = String.fromCharCode(char);
          break;
      }
      i = ii;
      pi += 1;
      if (i >= chars.length) {
        break;
      }
    }
    return chars;
  }
  function toHtml(arrayOfStrings) {
    var html = '<span class="apg-mono">';
    arrayOfStrings.forEach(function (str) {
      html += str;
    });
    return html + '</span>';
  }
  /* public functions */
  this.invalidChars = false;
  this.invalidEscapes = false;
  this.pchars = [];
  this.displayInput = function () {
    if (this.invalidChars) {
      var html = '<span class="apg-error"><h4>Input has invalid characters.</h4></span>';
      return html + toHtml(strings);
    }
    if (this.invalidEscapes) {
      var html = '<span class="apg-error"><h4>Input has invalid escaped characters.</h4></span>';
      return html + toHtml(strings);
    }
    return toHtml(pmap);
  };
  this.displayPhrases = function (phrases) {
    var i = 0;
    var html = '';
    for (var ii = 0; ii < phrases.length; ii += 1) {
      var phrase = phrases[ii];
      if (phrase.beg >= i) {
        while (i < phrase.beg) {
          html += pmap[i];
          i += 1;
        }
        if (phrase.beg === phrase.end) {
          html += '<span class="apg-empty-phrase">&#120576;</span>';
        } else {
          html += '<span class="apg-phrase">';
          while (i < phrase.end) {
            html += pmap[i];
            i += 1;
          }
          html += "</span>";
        }
      }
    }
    while (i < pmap.length) {
      html += pmap[i];
      i += 1;
    }
    return html;
  };
  /* constructor */
  strings = findInvalidChars(input);
  if (strings.length > 0) {
    /* handle invalid character errors */
    this.invalidChars = true;
    return;
  }
  if (mode === "escaped") {
    /* escaped character mode */
    var str = markupEscapes(input);
    strings = findInvalidEscapes(str, input);
    if (strings.length > 0) {
      /* handle invalid escapes errors */
      this.invalidEscapes = true;
      return;
    }
    translateEscapes(str, this.pchars, pmap);
  } else {
    /* ASCII only mode */
    translateCtrl(input, this.pchars, pmap);
  }
};
