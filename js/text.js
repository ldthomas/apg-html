// Character display functions for the input & phrase strings.
// ````
// arguments:
//  - base: the base object from setup
//  - codes: the input string character codes
//  - mode: the display mode, may be
//    - "ascii"
//    - "unicode"
//    - "decimal"
//    - "hexidecimal"
// ````
module.exports = function (base, codes, mode) {
  "use strict";
  var NORMAL = base.classes.normal;
  var CTRL = base.classes.ctrl;
  function charCodesToAscii(codes) {
    var str;
    var cls = NORMAL;
    var ret = [];
    for (var i = 0; i < codes.length; i += 1) {
      var code = codes[i];
      cls = NORMAL;
      switch (code) {
        case 9:
          str = "TAB";
          cls = CTRL;
          break;
        case 10:
          str = "LF";
          cls = CTRL;
          break;
        case 13:
          str = "CR";
          cls = CTRL;
          break;
        case 32:
          str = "\xa0";
          cls = NORMAL;
          break;
        default:
          if (code >= 33 && code <= 126) {
            str = String.fromCodePoint(code);
          } else {
            cls = CTRL;
            str = code.toString(16);
            if (str.length % 2 === 1) {
              str = "0" + str;
            }
            str = "\\x" + str;
          }
          break;
      }
      ret.push({
        str: str,
        cls: cls
      });
    }
    return ret;
  }
  function charCodesToUnicode(codes) {
    var str;
    var ret = [];
    for (var i = 0; i < codes.length; i += 1) {
      var code = codes[i];
      if (code === 9) {
        ret.push({
          str: "TAB",
          cls: CTRL
        });
      } else if (code === 10) {
        ret.push({
          str: "LF",
          cls: CTRL
        });
      } else if (code === 13) {
        ret.push({
          str: "CR",
          cls: CTRL
        });
      } else if (code === 32) {
        ret.push({
          str: "\xa0",
          cls: NORMAL
        });
      } else if (code >= 33 && code <= 126) {
        ret.push({
          str: String.fromCodePoint(code),
          cls: NORMAL
        });
      } else if (code <= 0xff) {
        var str = code.toString(16);
        if (str.length % 2 === 1) {
          str = "0" + str;
        }
        str = "\\x" + str;
        ret.push({
          str: str,
          cls: CTRL
        });
      } else if (code >= 0xd800 && code < 0xe000) {
        ret.push({
          str: "\\u" + code.toString(16),
          cls: CTRL
        });
      } else if (code > 0x10ffff) {
        var str = code.toString(16);
        if (str.length % 2 === 1) {
          str = "0" + str;
        }
        str = "\\u{" + str + "}";
        ret.push({
          str: str,
          cls: CTRL
        });
      } else {
        ret.push({
          str: String.fromCodePoint(code),
          cls: NORMAL
        });
      }
    }
    return ret;
  }
  function charCodesToDecimal(codes) {
    var ret = [];
    if (codes.length === 0) {
      return ret;
    }
    if (codes.length === 1) {
      ret.push({
        str: "" + codes[0],
        cls: NORMAL
      });
      return ret;
    }
    for (var i = 0; i < codes.length - 1; i += 1) {
      ret.push({
        str: codes[i] + ",",
        cls: NORMAL
      });
    }
    ret.push({
      str: "" + codes[codes.length - 1],
      cls: NORMAL
    });
    return ret;
  }
  function charCodesToHex(codes) {
    var str;
    var ret = [];
    for (var i = 0; i < codes.length; i += 1) {
      var code = codes[i];
      str = code.toString(16);
      if (str.length % 2 === 1) {
        str = "0" + str;
      }
      str = "\\x" + str;
      ret.push({
        str: str,
        cls: NORMAL
      });
    }
    return ret;
  }

  /* default mode is UNICODE */
  if (typeof (mode) === "string") {
    mode = mode.slice(0, 3).toLowerCase();
  } else {
    mode = "uni";
  }
  switch (mode) {
    case "asc":
      return charCodesToAscii(codes);
    default:
    case "uni":
      return charCodesToUnicode(codes);
    case "dec":
      return charCodesToDecimal(codes);
    case "hex":
      return charCodesToHex(codes);
  }
};
