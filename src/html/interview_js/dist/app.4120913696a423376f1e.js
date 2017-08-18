webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(5);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__asset_highlight_default_css__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__asset_highlight_default_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__asset_highlight_default_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__css_all_css__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__css_all_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__css_all_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__css_post_css__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__css_post_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__css_post_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__css_post_code_css__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__css_post_code_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__css_post_code_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__css_post_table_css__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__css_post_table_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__css_post_table_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__data_html__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__data_html___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__data_html__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__js_sendMsg_js__ = __webpack_require__(18);








var divElem = document.createElement('div');
divElem.innerHTML = __WEBPACK_IMPORTED_MODULE_5__data_html___default.a;
document.body.appendChild(divElem);

var preCodeElems = document.querySelectorAll('pre code');
for (var i = 0; i < preCodeElems.length; i++) {
  hljs.highlightBlock(preCodeElems[i]);
}

var apiElem = document.querySelector('table#api > tbody');

function f(k) {
  return typeof k === 'string' && !k.match(/__/);
}

var tr, td;
try {
  for (var arrayKeys = Reflect.ownKeys(Array.prototype).filter(f),
    objectKeys = Reflect.ownKeys(Object.prototype).filter(f),
    // reflectKeys = Reflect.ownKeys(Reflect.prototype).filter(f),
    count = Math.max(arrayKeys.length, objectKeys.length),
    i = 0, aK = arrayKeys[i], oK = objectKeys[i]; i < count;
    i++ , aK = arrayKeys[i], oK = objectKeys[i]) {

    tr = document.createElement('tr');
    apiElem.appendChild(tr);

    td = document.createElement('td');
    td.innerHTML = !!aK ? aK.toString() : '';
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = !!oK ? oK.toString() : '';
    tr.appendChild(td);

    // td = document.createElement('td');
    // td.innerHTML = !!rK ? rK.toString() : '';
    // tr.appendChild(td);
  }
} catch (e) {
  tr = document.createElement('tr');
  apiElem.appendChild(tr);

  td = document.createElement('td');
  td.setAttribute('colspan', '2');
  td.innerHTML = '你的浏览器不支持Reflect API!';
  tr.appendChild(td);
}

setInterval(__WEBPACK_IMPORTED_MODULE_6__js_sendMsg_js__["a" /* sendMessage */], 3000);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./default.css", function() {
			var newContent = require("!!../../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./default.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".hljs{display:block;overflow-x:auto;padding:0.5em;background:#F0F0F0}.hljs,.hljs-subst{color:#444}.hljs-comment{color:#888888}.hljs-keyword,.hljs-attribute,.hljs-selector-tag,.hljs-meta-keyword,.hljs-doctag,.hljs-name{font-weight:bold}.hljs-type,.hljs-string,.hljs-number,.hljs-selector-id,.hljs-selector-class,.hljs-quote,.hljs-template-tag,.hljs-deletion{color:#880000}.hljs-title,.hljs-section{color:#880000;font-weight:bold}.hljs-regexp,.hljs-symbol,.hljs-variable,.hljs-template-variable,.hljs-link,.hljs-selector-attr,.hljs-selector-pseudo{color:#BC6060}.hljs-literal{color:#78A960}.hljs-built_in,.hljs-bullet,.hljs-code,.hljs-addition{color:#397300}.hljs-meta{color:#1f7199}.hljs-meta-string{color:#4d99bf}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:bold}", ""]);

// exports


/***/ }),
/* 5 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./all.css", function() {
			var newContent = require("!!../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./all.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/* 盒模型，字体，尺寸基准 */\n*, *:before, *:after {\n    border: none;\n    padding: 0;\n    margin: 0;\n\n    box-sizing: border-box;\n}\n\n/* 字体 */\ncode {\n    font-family: Monaco, monospace;\n}\n\n/* 字号, 不能指定，会破坏Angular版博客壳的字号设定 */\nhtml {\n    font-family: 'Hiragino Sans GB', 'Comic San MS', '\\5FAE\\8F6F\\96C5\\9ED1', 'Microsoft Yahei', \"WenQuanYi Micro Hei\", sans-serif;\n    /*font-size: 10px;*/\n    /*font-weight: normal;*/\n}\n", ""]);

// exports


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./post.css", function() {
			var newContent = require("!!../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./post.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/* 段落 */\n.post-p {\n    font-size: 1rem;\n    text-indent: 2em;\n    margin: 1em 0;\n}\n\n.post-p a {\n    display: inline-block;\n    font-size: 0.8rem;\n    text-indent: 0;\n    text-decoration: none;\n    border-radius: 0.8em;\n    border: solid 1px #121;\n    padding: 0.3em 0.5em;\n    background-color: rgba(220, 220, 220, 0.5);\n}\n\n.post-p a:hover {\n    text-decoration: none;\n    background-color: rgba(220, 220, 220, 1);\n}\n\n/* 带标题段落 */\n.titled-post-p:before {\n    content: attr(data-title);\n\n    font-size: 1.8rem;\n}\n\n/* 带行标背景的段落 */\n.bg-post-p {\n    line-height: 1.5em;\n    background: url(" + __webpack_require__(10) + ") repeat;\n    background-size: 6px 1.5em;\n}\n\n/* 提问段落 */\np.q {\n    display: block;\n    width: 100%;\n    height: auto;\n    font-size: 1.3rem;\n    line-height: 2em;\n    padding-left: 1em;\n    background: linear-gradient(90deg, #eeebbc 0, #eeddee 5%, #eeebec 100%);\n}\n\np.a {\n  margin: 1em 1.2em;\n}\n\n/* 列表 */\nul, ol {\n    font-family: \"Source Code Pro\", monospace;\n}\n\nol.post-l {\n    list-style-type: decimal;\n}\n\nol.post-l, ul.post-l {\n    margin: 1em 0;\n}\n\nol.post-l > li, ul.post-l > li {\n    font-size: 0.9rem;\n    list-style-position: inside;\n}\n\nol.post-l p.post-p {\n    font-size: 0.9rem;\n    text-indent: 0;\n}\n\n/* 抽屉列表 */\nul.post-drawer-l > li {\n    cursor: pointer;\n}\n\nul.post-drawer-l > li:not(.active) {\n    list-style: square inside url(" + __webpack_require__(11) + ");\n}\n\nul.post-drawer-l > li.active {\n    list-style: square inside url(" + __webpack_require__(12) + ");\n}\n\nul.post-drawer-l > li > .hidden {\n    display: none;\n}\n\nul.post-drawer-l > li.active > .hidden {\n    display: block;\n}\n\n/* 图片 */\nimg {\n    max-width: 100%;\n}\n\n/* image gallery */\nul.gallery {\n    list-style: none;\n\n    display: flex;\n    flex-direction: row;\n    flex-wrap: nowrap;\n    overflow-x: auto;\n\n    height: 220px;\n}\n\nul.gallery > li {\n    width: 200px;\n    height: 200px;\n\n    flex-shrink: 0;\n    background: rgba(0, 0, 0, 0.3);\n}\n\nul.gallery > li > img {\n    width: 200px;\n    height: 200px;\n}\n\nul.gallery > li > img:hover {\n    transform: scale(1.1);\n}\n", ""]);

// exports


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "71ecb478e5b31f72d7570e734eb4f7fc.png";

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "746dc54d093986a56e5c8e1282a5289d.png";

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "6115e32fec7262ad8c9ede6c08e863bb.png";

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(14);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./post-code.css", function() {
			var newContent = require("!!../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./post-code.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/* 代码框 */\n.code-border {\n    display: block;\n\n    width: calc(100% - 2.4em);\n    max-height: 50em;\n\n    font-size: 12px;\n\n    margin: 10px 1.2em;\n    padding: 5px 10px;\n\n    border-radius: 5px;\n    border: solid 5px #000000;\n\n    box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.75);\n    background-image: radial-gradient(circle 500px at 30% 30%, #f0f0f0 0%, #ffffff 90%, #f9f9f9 100%);\n    \n    overflow: auto;\n}\n\n.code-border > code {\n    background-color: transparent;\n}\n", ""]);

// exports


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(16);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./post-table.css", function() {
			var newContent = require("!!../html/interview_js/node_modules/.0.28.5@css-loader/index.js!./post-table.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/* table */\ntable {\n    margin: 1em auto;\n\n    border-collapse: collapse;\n\n}\n\ntable, th, td {\n    border: 1px solid rgba(0, 0, 0, 0.1);\n\n    /*-webkit-box-shadow: 0 0 .5px .3px #001100;*/\n    /*-moz-box-shadow: 0 0 .5px .3px #001100;*/\n    /*box-shadow: 0 0 .5px .3px #001100;*/\n}\n\nth, td {\n    line-height: 2em;\n    text-align: center;\n}\n\nth {\n    font-size: 1.3em;\n    font-weight: 900;\n\n    background-color: #cac5ff;\n}\n\ntd {\n    font-size: 1em;\n}\n\ntr:nth-child(odd) > td {\n    background-color: #cdffd2;\n}\n\ntr:nth-child(even) > td {\n    background-color: #edffd5;\n}\n", ""]);

// exports


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = "<p class=\"q\">介绍JavaScript的基本数据类型。</p>\n<ul class=\"post-l\">\n  <li>Number 数字类型</li>\n  <li>String 字符串类型</li>\n  <li>Boolean 布尔类型</li>\n  <li>Function 函数</li>\n  <li>Object 对象</li>\n  <li>Null</li>\n  <li>Undefined 没有定义类型</li>\n</ul>\n\n<p class=\"q\">说说写JavaScript的基本规范？</p>\n<p class=\"a post-p\">一切都已经习惯成自然, 有一点很有意思: </p>\n<p class=\"a post-p\">为了避免混乱，建议在HTML中使用双引号，在JavaScript中使用单引号。</p>\n\n<p class=\"q\">JavaScript原型，原型链? 有什么特点？</p>\n<p class=\"a post-p\">prototype是构造函数的一个属性, 该属性指向一个对象. 而这个对象将作为该构造函数所创建的所有实例的基引用(base reference), 可以把对象的基引用想像成一个自动创建的隐藏属性. 当访问对象的一个属性时, 首先查找对象本身,\n  找到则返回; 若不, 则查找基引用指向的对象的属性(如果还找不到实际上还会沿着原型链向上查找, 直至到根). 只要没有被覆盖的话, 对象原型的属性就能在所有的实例中找到.</p>\n\n<p class=\"q\">JavaScript有几种类型的值？（堆：原始数据类型和 栈：引用数据类型），你能画一下他们的内存图吗？</p>\n<p class=\"a post-p\">\n  基本数据类型存储在栈中，引用数据类型（对象）存储在堆中，指针放在栈中。两种类型的区别是：存储位置不同；原始数据类型直接存储在栈(stack)中的简单数据段，占据空间小、大小固定，属于被频繁使用数据，所以放入栈中存储；引用数据类型存储在堆(heap)中的对象,占据空间大、大小不固定,如果存储在栈中，将会影响程序运行的性能；引用数据类型在栈中存储了指针，该指针指向堆中该实体的起始地址。当解释器寻找引用值时，会首先检索其在栈中的地址，取得地址后从堆中获得实体。</p>\n\n<p class=\"q\">Javascript如何实现继承？</p>\n<p class=\"a post-p\">\n  构造继承，原型继承，（实例继承，拷贝继承）。构造函数继承可以将构造函数的属性拷贝给实例（＊.call(this,[])）。但是缺点是无法实现函数复用。原型继承可以实现函数复用，但是所有实例共享一个属性，任意一个实例改变原型属性都会改变其它实例的属性值。推荐采用构造函数继承传递属性（拷贝），原型继承传递方法.</p>\n\n<p class=\"q\">Javascript创建对象的几种方式？</p>\n<ul class=\"post-l\">\n  <li>对象字面量的方式p＝{};</li>\n  <li>用function来模拟无参的构造函数，再定义属性;</li>\n  <li>用function模拟构造函数，利用this;</li>\n  <li>利用工厂方式（内置对象Object）;</li>\n  <li>利用原型方式来创建;</li>\n  <li>混合方式来创建。</li>\n</ul>\n\n<p class=\"q\">Javascript作用域链?</p>\n<p class=\"a post-p\">闭包。</p>\n<p class=\"a post-p\">\n  当代码在一个环境中执行时，会创建变量对象的一个作用域链。如果是个函数，则将其活动对象作为变量对象。活动对象在最开始只包含一个arguments对象。而下一个变量对象则来自下一个包含环境。如此一直延续到全局执行环境，这种组织形式即为作用域链。内部函数可访问外部变量，外部变量无法访问内部函数。注意：js没有块级作用域，若要形成块级作用域，可通过（function（）｛｝）（）；立即执行的形式实现。</p>\n\n<p class=\"q\">谈谈This对象的理解。</p>\n<ul class=\"post-l\">\n  <li>this总是指向函数的直接调用者（而非间接调用者）;</li>\n  <li>如果有new关键字，this指向new出来的那个对象;</li>\n  <li>在事件中，this指向触发这个事件的对象，特殊的是，IE中的attachEvent中的this总是指向全局对象Window; 在addEventListener中this总是指向DomElement。</li>\n</ul>\n\n<p class=\"q\">eval是做什么的？</p>\n<p class=\"a post-p\">计算某个字符串，并执行其中的的 JavaScript 代码。eval(string)。应该避免使用eval，不安全，非常耗性能（2次，一次解析成js语句，一次执行）。由JSON字符串转换为JSON对象的时候可以用eval，var obj =eval('('+\n  str +')');\n</p>\n<p class=\"a post-p\">当然, 使用JSON.parse更佳。</p>\n<p class=\"a post-p\">非严格模式下, eval里变量的作用域是window。</p>\n\n<p class=\"q\">什么是window对象? 什么是document对象?</p>\n<p class=\"a post-p\">Window对象代表浏览器中打开的一个窗口。document对象代表整个HTML文档。</p>\n\n<p class=\"q\">null，undefined的区别？</p>\n<p class=\"a post-p\">null表示一个对象被定义了，但存放的是空指针。undefined 表示这个值不存在。typeof（null）－object；typeof（undefined）－undefined。</p>\n\n<p class=\"q\">写一个通用的事件侦听器函数(机试题)。</p>\n<pre class=\"code-border\"><code class=\"javascript\">\n(dom.addEventListener || dom.attachEvent)(function(event){\nconsole.log(event);\n});\n</code></pre>\n\n<p class=\"q\">[\"1\", \"2\", \"3\"].map(parseInt) 答案是多少？</p>\n<p class=\"a post-p\">[1, NaN, NaN] <a href=\"../misc/examples/map.html\" class=\"ex\" target=\"_blank\">查看console结果。</a></p>\n<ul class=\"post-l\">\n  <li>parseInt(\"1\", 0); // 1</li>\n  <li>parseInt(\"2\", 1); // NaN</li>\n  <li>parseInt(\"3\", 2); // NaN</li>\n</ul>\n\n<p class=\"q\">关于事件，IE与火狐的事件机制有什么区别？ 如何阻止冒泡？</p>\n<p class=\"a post-p\">IE为事件冒泡，Firefox同时支持事件捕获和冒泡事件。但并非所有浏览器都支持事件捕获。jQuery中使用event.stopPropagation()方法可阻止冒泡;（旧ie的方法 ev.cancelBubble = true;）</p>\n\n<p class=\"q\">什么是闭包（closure），为什么要用它？</p>\n<p class=\"a post-p\">\n  闭包指的是一个函数可以访问另一个函数作用域中变量的函数。常见的构造方法，是在一个函数内部定义另外一个函数。内部函数可以引用外层的参数和变量；参数和变量不会被垃圾回收机制回收。注意，闭包的原理是作用域链，所以闭包访问的上级作用域中的变量是个对象，其值为其运算结束后的最后一个值。除非用立即执行函数来解决。</p>\n<p class=\"a post-p\">大二时，准备一个关于闭包的PPT来的，怎么也理不清思路，理解不了闭包；最后的PPT自己都感觉大假空，更别提演讲了，^_^</p>\n\n<p class=\"q\">javascript 代码中的”use strict”;是什么意思 ? 使用它区别是什么？</p>\n<p class=\"a post-p\">use strict是一种ECMAscript 5 添加的（严格）运行模式,这种模式使得 Javascript 在更严格的条件下运行,使JS编码更加规范化的模式,消除Javascript语法的一些不合理、不严谨之处，减少一些怪异行为。目前支持的浏览器为IE10+，Firefox\n  4+，Safari 5.1+和Chrome。默认支持的糟糕特性都会被禁用，比如不能用with，也不能在意外的情况下给全局变量赋值全局变量的显示声明,函数必须声明在顶层，不允许在非函数代码块内声明函数,arguments.callee也不允许使用；消除代码运行的一些不安全之处，保证代码运行的安全,限制函数中的arguments修改，严格模式下的eval函数的行为和非严格模式的也不相同(严格模式下eval用法无效,\n  如果在 eval 函数内声明变量，则不能在此函数外部使用该变量。);提高编译器效率，增加运行速度；为未来新版本的Javascript标准化做铺垫。</p>\n\n<p class=\"q\">如何判断一个对象是否属于某个类？</p>\n<p class=\"a post-p\">instanceof</p>\n\n<p class=\"q\">new操作符具体干了什么呢?</p>\n<ul class=\"post-l\">\n  <li>创建一个空对象，并且 this 变量引用该对象，同时还继承了该函数的原型。</li>\n  <li>属性和方法被加入到 this 引用的对象中</li>\n  <li>新创建的对象由 this 所引用，并且最后隐式的返回 this</li>\n</ul>\n\n<p class=\"q\">用原生JavaScript的实现过什么功能吗？</p>\n<p class=\"a post-p\">querySelector</p>\n<p class=\"a post-p\">Array API</p>\n<p class=\"a post-p\">我爱原生API!!!</p>\n<p class=\"a post-p\">目前这个网站大多建立在原生API上。</p>\n\n<p class=\"q\">Javascript中，有一个函数，执行时对象查找时，永远不会去查找原型，这个函数是？</p>\n<p class=\"a post-p\">Object.prototype.hasOwnProperty()</p>\n\n<p class=\"q\">对JSON的了解？</p>\n<p class=\"a post-p\">JSON.parse()</p>\n<p class=\"a post-p\">JSON.stringify()</p>\n\n<p class=\"q\">[].forEach.call($$(\"*\"),function(a){ a.style.outline=\"1px solid #\"+(~~(Math.random()*(1&lt;24))).toString(16) }) 能解释一下这段代码的意思吗？</p>\n    <p class=\"a post-p\">操作符~， 是按位取反的意思，表面上~~（取反再取反）没有意义，实际上在JS中可以将浮点数变成整数。</p>\n    <p class=\"a post-p\">为每一个元素加上随机上色的边框。</p>\n\n    <p class=\"q\">js延迟加载的方式有哪些？</p>\n    <ul class=\"post-l\">\n      <li>script标签的defer、async属性。Opera浏览器不支持。defer属性必须由含src属性的script标签含有。</li>\n      <li>动态添加script dom节点。</li>\n      <li>setTimeout</li>\n    </ul>\n\n    <p class=\"q\">Ajax 是什么? 如何创建一个Ajax？</p>\n    <p class=\"a post-p\">ajax的全称：Asynchronous Javascript And XML。所谓异步，在这里简单地解释就是：向服务器发送请求的时候，我们不必等待结果，而是可以同时做其他的事情，等到有了结果它自己会根据设定进行后续操作，与此同时，页面是不会发生整页刷新的，提高了用户体验。\n    </p>\n    <ul class=\"post-l\">\n      <li>创建XMLHttpRequest对象,也就是创建一个异步调用对象</li>\n      <li>创建一个新的HTTP请求,并指定该HTTP请求的方法、URL及验证信息</li>\n      <li>设置响应HTTP请求状态变化的函数</li>\n      <li>发送HTTP请求</li>\n      <li>获取异步调用返回的数据</li>\n      <li>使用JavaScript和DOM实现局部刷新</li>\n    </ul>\n\n    <p class=\"q\">同步和异步的区别?</p>\n    <p class=\"a post-p\">\n      同步的概念应该是来自于OS中关于同步的概念:不同进程为协同完成某项工作而在先后次序上调整(通过阻塞,唤醒等方式).同步强调的是顺序性.谁先谁后.异步则不存在这种顺序性.同步：浏览器访问服务器请求，用户看得到页面刷新，重新发请求,等请求完，页面刷新，新内容出现，用户看到新内容,进行下一步操作。异步：浏览器访问服务器请求，用户正常操作，浏览器后端进行请求。等请求完，页面不刷新，新内容也会出现，用户看到新内容。</p>\n\n    <p class=\"q\">如何解决跨域问题?</p>\n    <table>\n      <thead>\n        <tr>\n          <th>URL</th>\n          <th>说明</th>\n          <th>是否允许通信</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td>http://www.a.com/survey_and_exam.js<br>http://www.a.com/b.js</td>\n          <td>同一域名下</td>\n          <td>允许</td>\n        </tr>\n        <tr>\n          <td>http://www.a.com/lab/survey_and_exam.js<br>http://www.a.com/script/b.js</td>\n          <td>同域名下不同文件夹</td>\n          <td>允许</td>\n        </tr>\n        <tr>\n          <td>http://www.a.com:8080/survey_and_exam.js<br>http://www.a.com/b.js</td>\n          <td>同一域名，不同端口</td>\n          <td>不允许</td>\n        </tr>\n        <tr>\n          <td>http://www.a.com/survey_and_exam.js<br>https://www.a.com/b.js</td>\n          <td>同一域名，不同协议</td>\n          <td>不允许</td>\n        </tr>\n        <tr>\n          <td>http://www.a.com/survey_and_exam.js<br>http://123.123.123.123/b.js</td>\n          <td>域名和域名对应IP</td>\n          <td>不允许</td>\n        </tr>\n        <tr>\n          <td>http://www.a.com/survey_and_exam.js<br>http://script.a.com/b.js</td>\n          <td>主域相同，子域不同</td>\n          <td>不允许</td>\n        </tr>\n        <tr>\n          <td>http://www.a.com/survey_and_exam.js<br>http://a.com/b.js</td>\n          <td>主域相同，不同二级域名（同上）</td>\n          <td>不允许（cookie neither）</td>\n        </tr>\n        <tr>\n          <td>http://www.a.com/survey_and_exam.js<br>http://www.b.com/b.js</td>\n          <td>不同域名</td>\n          <td>不允许</td>\n        </tr>\n      </tbody>\n    </table>\n    <p class=\"a post-p\">前端解决跨域问题的方法:</p>\n    <ul class=\"post-l\">\n      <li>document.domain + iframe (只有在主域相同的时候才能使用该方法)</li>\n      <li>动态创建script</li>\n      <li>location.hash + iframe</li>\n      <li>window.name + iframe</li>\n      <li>postMessage（HTML5中的XMLHttpRequest Level 2中的API）(由于同源策略，这里event.source不可以访问window对象)</li>\n      <li>CORS (xdr)</li>\n      <li>JSONP</li>\n      <li>web sockets</li>\n    </ul>\n    <p class=\"a post-p\"><a href=\"http://blog.csdn.net/joyhen/article/details/21631833\" class=\"ex\" target=\"_blank\">外文链接</a></p>\n\n    <p class=\"q\">页面编码和被请求的资源编码如果不一致如何处理？</p>\n    <pre class=\"code-border\"><code class=\"html\">\n&lt;script src=\"http://www.xxx.com/test.js\" charset=\"utf-8\"&gt;&lt;/script&gt;\n</code></pre>\n\n    <p class=\"q\">模块化开发怎么做？</p>\n    <p class=\"a post-p\">就个人心得讲, 模块化是熟悉业务以后, 自然而然的产物。</p>\n\n    <p class=\"q\">AMD（Modules/Asynchronous-Definition）、CMD（Common Module Definition）规范区别？</p>\n    <p class=\"a post-p\">对于依赖的模块，AMD 是提前执行，CMD 是延迟执行。</p>\n    <p class=\"a post-p\">CMD 推崇依赖就近，AMD 推崇依赖前置。</p>\n\n    <p class=\"q\">requireJS的核心原理是什么？（如何动态加载的？如何避免多次加载的？如何 缓存的？）</p>\n    <p class=\"a post-p\">requireJS通过动态创建script标签动态加载JS文件。</p>\n    <p class=\"a post-p\">为了避免多次加载, requireJS为每个文件编号, 编号相同的文件只加载一次。</p>\n\n    <p class=\"q\">让你自己设计实现一个requireJS，你会怎么做？</p>\n    <p class=\"a post-p\">我确实自己实现过一个loader, 使用jquery ajax加载script。不过, 当时更多的是业务上的逻辑, 以适应不同平台的页面。</p>\n\n    <p class=\"q\">谈一谈你对ECMAScript6的了解？</p>\n    <p class=\"a post-p\"><a href=\"http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651551081&idx=1&sn=fbab887bf0f91de2bb33c405f9392fe4&scene=0#wechat_redirect\"\n        class=\"ex\" target=\"_blank\">外文链接</a></p>\n\n    <p class=\"q\">document.write和 innerHTML 的区别?</p>\n    <p class=\"a post-p\">document.write是重写整个document, 写入内容是字符串的html</p>\n    <p class=\"a post-p\">innerHTML是HTMLElement的属性，是一个元素的内部html内容</p>\n\n    <p class=\"q\">DOM操作——怎样添加、移除、移动、复制、创建和查找节点?</p>\n    <p class=\"a post-p\">appendChild</p>\n    <p class=\"a post-p\">removeChild</p>\n    <p class=\"a post-p\">querySelector</p>\n    <p class=\"a post-p\">insertBefore</p>\n    <p class=\"a post-p\">insertAfter</p>\n\n    <p class=\"q\">.call() 和 .apply() 的含义和区别？</p>\n    <p class=\"a post-p\">相比call, apply接收数组作为参数列表。</p>\n\n    <p class=\"q\">数组和对象有哪些原生方法，列举一下？</p>\n    <table id=\"api\">\n      <thead>\n        <tr>\n          <th>Array API</th>\n          <th>Object API</th>\n          <!--<th>Reflect API</th>-->\n        </tr>\n      </thead>\n      <tbody></tbody>\n    </table>\n\n    <p class=\"q\">JS 怎么实现一个类。怎么实例化这个类</p>\n    <p class=\"a post-p\">JS ES5是函数为第一类元素的存在, 所以通过new fn实例化一个类, fn内部this指针为正在实例化的对象指针。</p>\n\n    <p class=\"q\">JavaScript中的作用域与变量声明提升？</p>\n    <p class=\"a post-p\">变量声明提升即执行function时, 内部变量的内存空间会第一时间创建出来。</p>\n\n    <p class=\"q\">如何编写高性能的Javascript？</p>\n    <p class=\"a post-p\">尽量使用原生API, 使用高效的算法。</p>\n    <p class=\"a post-p\">合理使用缓存。</p>\n\n    <p class=\"q\">那些操作会造成内存泄漏？</p>\n    <ul class=\"post-l\">\n      <li>给DOM对象添加的属性是一个对象的引用。document.getElementById('myDiv').myProp = {};</li>\n      <li>DOM对象与JS对象相互引用。</li>\n      <li>给DOM对象用attachEvent绑定事件。</li>\n    </ul>\n\n    <p class=\"q\">JQuery的源码看过吗？能不能简单概况一下它的实现原理？</p>\n    <p class=\"a post-p\">封装。 P.S.jquery使用的el解析库并不是document.querySelector</p>\n\n    <p class=\"q\">jQuery.fn的init方法返回的this指的是什么对象？为什么要返回this？</p>\n    <p class=\"a post-p\">即jQuery对象, this是new关键字创建的对象指针。</p>\n\n    <p class=\"q\">jquery中如何将数组转化为json字符串，然后再转化回来？</p>\n    <p class=\"a post-p\">这个有原生API啊, JSON.parse .stringify</p>\n\n    <p class=\"q\">jQuery 的属性拷贝(extend)的实现原理是什么，如何实现深拷贝？</p>\n    <pre class=\"code-border\"><code class=\"javascript\">\njQuery.extend = jQuery.fn.extend = function() {\nvar options, name, src, copy, copyIsArray, clone,\ntarget = arguments[0] || {},\ni = 1,\nlength = arguments.length,\ndeep = false;\n\n// Handle a deep copy situation\nif ( typeof target === \"boolean\" ) {\ndeep = target;\ntarget = arguments[1] || {};\n// skip the boolean and the target\ni = 2;\n}\n\n// Handle case when target is a string or something (possible in deep copy)\nif ( typeof target !== \"object\" && !jQuery.isFunction(target) ) {\ntarget = {};\n}\n\n// extend jQuery itself if only one argument is passed\nif ( length === i ) {\ntarget = this;\n--i;\n}\n\nfor ( ; i < length; i++ ) {\n// Only deal with non-null/undefined values\nif ( (options = arguments[ i ]) != null ) {\n// Extend the base object\nfor ( name in options ) {\nsrc = target[ name ];\ncopy = options[ name ];\n\n// Prevent never-ending loop\nif ( target === copy ) {\n    continue;\n}\n\n// Recurse if we're merging plain objects or arrays\nif ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {\n    if ( copyIsArray ) {\n        copyIsArray = false;\n        clone = src && jQuery.isArray(src) ? src : [];\n\n    } else {\n        clone = src && jQuery.isPlainObject(src) ? src : {};\n    }\n\n    // Never move original objects, clone them\n    target[ name ] = jQuery.extend( deep, clone, copy );\n\n// Don't bring in undefined values\n} else if ( copy !== undefined ) {\n    target[ name ] = copy;\n}\n}\n}\n}\n\n// Return the modified object\nreturn target;\n};\n</code></pre>\n    <p class=\"a post-p\">源码面前, 没有秘密。</p>\n\n    <p class=\"q\">jquery.extend 与 jquery.fn.extend的区别？</p>\n    <p class=\"a post-p\">jquery.extend是工具方法。</p>\n    <p class=\"a post-p\">jquery.fn.extend是修改的是jquery本身。</p>\n\n    <p class=\"q\">jQuery 的队列是如何实现的？队列可以用在哪些地方？</p>\n    <p class=\"a post-p\">底层利用Array的push、shift。可以用在动画上, 分镜。</p>\n\n    <p class=\"q\">谈一下Jquery中的bind(),live(),delegate(),on()的区别？</p>\n    <ul class=\"post-l\">\n      <li>.bind()是直接绑定在元素上</li>\n      <li>.live()则是通过冒泡的方式来绑定到元素上的。更适合列表类型的，绑定到document DOM节点上。和.bind()的优势是支持动态数据</li>\n      <li>.delegate()则是更精确的小范围使用事件代理，性能优于.live()</li>\n      <li>.on()则是最新的1.9版本整合了之前的三种方式的新事件绑定机制</li>\n    </ul>\n\n    <p class=\"q\">JQuery一个对象可以同时绑定多个事件，这是如何实现的？</p>\n    <p class=\"a post-p\">jQuery内部维护一个handler对象数组, 当某个事件触发时, 调用相应数组内的所有事件处理函数。</p>\n\n    <p class=\"q\">是否知道自定义事件。jQuery里的fire函数是什么意思，什么时候用？</p>\n    <p class=\"a post-p\">并没有在jQuery 3.1中找到事件的fire函数。貌似以前也只听说过trigger函数。</p>\n\n    <p class=\"q\">jQuery 是通过哪个方法和 Sizzle 选择器结合的？（jQuery.fn.find()进入Sizzle）</p>\n    <p class=\"a post-p\">为什么用 Sizzle 而不是 document.querySelector 呢?</p>\n\n    <p class=\"q\">针对 jQuery性能的优化方法？</p>\n    <p class=\"a post-p\">原生方法 > jQuery工具函数 > jQuery对象方法</p>\n    <p class=\"a post-p\">读取局部变量比读取全局变量快得多.在调用对象方法的时候，closure模式要比prototype模式更快.</p>\n    <p class=\"a post-p\">使用Pub/Sub模式管理事件(.on, .trigger), 还可以考虑使用deferred对象(promise)。</p>\n\n    <p class=\"q\">jQuery UI 与 jquery 的主要区别?</p>\n    <p class=\"a post-p\">jQuery是一个js库，主要提供的功能是选择器，属性修改和事件绑定等等。jQuery UI则是在jQuery的基础上，利用jQuery的扩展性，设计的插件。提供了一些常用的界面元素，诸如对话框、拖动行为、改变大小行为等等。\n    </p>\n\n    <p class=\"q\">jquery 中如何将数组转化为json字符串，然后再转化回来？</p>\n    <pre class=\"code-border\"><code class=\"javascript\">\n$.fn.stringify = function() {\nreturn JSON.stringify(this);\n}\n\n$(array).stringify();\n</code></pre>\n\n    <p class=\"q\">jQuery和Zepto的区别？各自的使用场景？</p>\n    <p class=\"a post-p\">Zepto属轻量级js库, 主要应用在移动端。不过, 我之前的开发中不很喜欢使用这个库, 给人的感觉是限制太多。</p>\n\n    <p class=\"q\">Zepto的点透问题如何解决？</p>\n    <p class=\"a post-p\">科普: zepto的tap通过兼听绑定在document上的touch事件来完成tap事件的模拟的,及tap事件是冒泡到document上触发的,再点击完成时的tap事件(touchstart\\touchend)需要冒泡到document上才会触发，而在冒泡到document之前，用户手的接触屏幕(touchstart)和离开屏幕(touchend)是会触发click事件的,因为click事件有延迟触发(这就是为什么移动端不用click而用tap的原因)(大概是300ms,为了实现safari的双击事件的设计)，所以在执行完tap事件之后，弹出来的选择组件马上就隐藏了，此时click事件还在延迟的300ms之中，当300ms到来的时候，click到的其实不是完成而是隐藏之后的下方的元素，如果正下方的元素绑定的有click事件此时便会触发，如果没有绑定click事件的话就当没click，但是正下方的是input输入框(或者select选择框或者单选复选框)，点击默认聚焦而弹出输入键盘，也就出现了上面的点透现象。\n    </p>\n    <p class=\"a post-p\">用touchend代替tap事件并阻止掉touchend的默认行为preventDefault().</p>\n\n    <p class=\"q\">jQueryUI如何自定义组件?</p>\n    <p class=\"a post-p\">用$.widget()方法开始定义你的组件，它只接收三个参数：第一个是组件名称，第二个是可选的基类组件（默认的基类是$.Widget），第三个是组件的原型。</p>\n\n    <p class=\"q\">需求：实现一个页面操作不会整页刷新的网站，并且能在浏览器前进、后退时正确响应。给出你的技术实现方案？</p>\n    <p class=\"a post-p\">使用history popup事件。本页面即是。</p>\n\n    <p class=\"q\">如何判断当前脚本运行在浏览器还是node环境中？（阿里）</p>\n    <p class=\"a post-p\">window对象。通过判断Global对象是否为window，如果不为window，当前脚本没有运行在浏览器中。</p>\n\n    <p class=\"q\">移动端最小触控区域是多大？</p>\n    <p class=\"a post-p\">移动端最小触控区域 44*44px ，再小就容易点击不到或者误点。</p>\n\n    <p class=\"q\">jQuery 的 slideUp动画 ，如果目标元素是被外部事件驱动, 当鼠标快速地连续触发外部元素事件, 动画会滞后的反复执行，该如何处理呢?</p>\n    <ol class=\"post-l\">\n      <li>在触发元素上的事件设置为延迟处理, 即可避免滞后反复执行的问题（使用setTimeout）</li>\n      <li>在触发元素的事件时预先停止所有的动画，再执行相应的动画事件（使用stop）</li>\n    </ol>\n    <ul class=\"post-l\">\n      <li>$(\"#div\").stop();//停止当前动画，继续下一个动画</li>\n      <li>$(\"#div\").stop(true);//清除元素的所有动画</li>\n      <li>$(\"#div\").stop(false, true);//让当前动画直接到达末状态 ，继续下一个动画</li>\n      <li>$(\"#div\").stop(true, true);//清除元素的所有动画，让当前动画直接到达末状态</li>\n    </ul>\n\n    <p class=\"q\">移动端的点击事件的有延迟，时间是多久，为什么会有？ 怎么解决这个延时？</p>\n    <p class=\"a post-p\">click 有 300ms 延迟,为了实现safari的双击事件的设计，浏览器要知道你是不是要双击操作。</p>\n    <p class=\"a post-p\">使用touch事件代替click事件。</p>\n\n    <p class=\"q\">知道各种JS框架(Angular, Backbone, Ember, React, Meteor, Knockout…)么? 能讲出他们各自的优点和缺点么?</p>\n    <p class=\"a post-p\">接触过Angular, Backbone, React。分别是依赖注入, MVC设计模式, 一门新语法。</p>\n\n    <p class=\"q\">Underscore 对哪些 JS 原生对象进行了扩展以及提供了哪些好用的函数方法？</p>\n    <p class=\"a post-p\"><a href=\"http://underscorejs.org/#collections\" class=\"ex\" target=\"_blank\">官方文档</a></p>\n\n    <p class=\"q\">如何测试前端代码么? 知道BDD, TDD, Unit Test么? 知道怎么测试你的前端工程么(mocha, sinon, jasmin, qUnit..)?</p>\n    <p class=\"a post-p\">通过了解Angular, 认识到前端代码自动化测试工程。</p>\n\n    <p class=\"q\">前端templating(Mustache, underscore, handlebars)是干嘛的, 怎么用?</p>\n    <p class=\"a post-p\">代替繁琐的拼接字符串的工作。</p>\n\n    <p class=\"q\">简述一下 Handlebars 的基本用法？</p>\n    <p class=\"a post-p\"><a href=\"http://handlebarsjs.com/expressions.html\" class=\"ex\" target=\"_blank\">官方文档</a></p>\n\n    <p class=\"q\">简述一下 Handlerbars 的对模板的基本处理流程， 如何编译的？如何缓存的？</p>\n    <p class=\"a post-p\">我认真研读过doT的源代码, 模板编译的过程就是将模板语言转化为函数字符串, 其中重要的是数据变量名需保持一致。而handlebars应该是在模板中省略了该变量, 编译过程中自动添加的。\n    </p>\n\n    <p class=\"q\">用js实现千位分隔符?(来源：前端农民工，提示：正则+replace)</p>\n    <pre class=\"code-border\"><code class=\"javascript\">\nfunction thousandBitSeparator(num) {\nreturn num && (num.toString().indexOf('.') != -1\n? num.toString().replace(/(\\d)(?=(\\d{3})+\\.)/g, function($0, $1) {\nreturn $1 + \",\";\n}) : num.toString().replace(/(\\d)(?=(\\d{3})+$)/g, function($0, $1) {\nreturn $1 + \",\";\n}));\n}\n</code></pre>\n\n    <p class=\"q\">检测浏览器版本版本有哪些方式？</p>\n    <p class=\"a post-p\">UserAgent</p>\n\n    <p class=\"q\">我们给一个dom同时绑定两个点击事件，一个用捕获，一个用冒泡，你来说下会执行几次事件，然后会先执行冒泡还是捕获</p>\n    <p class=\"a post-p\">先捕获,后冒泡。</p>";

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = sendMessage;
function sendMessage() {
  if (window.top !== window) {
    var path = location.href.toString();
    var data = JSON.stringify({
      path: path.substr(path.indexOf('serve/') + 'serve'.length),
      height: document.body.scrollHeight
    });

    window.top.postMessage(data, '*');
  }
}

/***/ })
],[2]);