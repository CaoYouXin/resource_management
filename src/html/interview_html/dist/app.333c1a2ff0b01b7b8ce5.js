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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__data_html__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__data_html___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__data_html__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__js_sendMsg_js__ = __webpack_require__(16);







var divElem = document.createElement('div');
divElem.innerHTML = __WEBPACK_IMPORTED_MODULE_4__data_html___default.a;
document.body.appendChild(divElem);

var preCodeElems = document.querySelectorAll('pre code');
for (var i = 0; i < preCodeElems.length; i++) {
  hljs.highlightBlock(preCodeElems[i]);
}

setInterval(__WEBPACK_IMPORTED_MODULE_5__js_sendMsg_js__["a" /* sendMessage */], 3000);

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
		module.hot.accept("!!../../html/interview_html/node_modules/css-loader/index.js!./default.css", function() {
			var newContent = require("!!../../html/interview_html/node_modules/css-loader/index.js!./default.css");
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
		module.hot.accept("!!../html/interview_html/node_modules/css-loader/index.js!./all.css", function() {
			var newContent = require("!!../html/interview_html/node_modules/css-loader/index.js!./all.css");
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
		module.hot.accept("!!../html/interview_html/node_modules/css-loader/index.js!./post.css", function() {
			var newContent = require("!!../html/interview_html/node_modules/css-loader/index.js!./post.css");
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
		module.hot.accept("!!../html/interview_html/node_modules/css-loader/index.js!./post-code.css", function() {
			var newContent = require("!!../html/interview_html/node_modules/css-loader/index.js!./post-code.css");
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
/***/ (function(module, exports) {

module.exports = "<p class=\"q\">\n  Doctype作用？严格模式与混杂模式如何区分？它们有何意义?</p>\n<p class=\"a post-p\">Doctype的作用一定是描述文档本身, 并且告诉浏览器如何渲染该文档。DTD概念缘于SGML，每一份SGML 文件，均应有相对应的DTD。HTML5 不基于 SGML，所以不需要引用 DTD。\n</p>\n<p class=\"a post-p\">严格模式与混杂模式是不同版本浏览器对具有不同Doctype的文档的不同渲染模式。其意义主要在于新版本浏览器兼容旧规范下的文档。</p>\n<p class=\"a post-p\">HTML5 认准: <code>&lt;!DOCTYPE html&gt;</code></p>\n\n\n<p class=\"q\">HTML5 为什么只需要写&lt;!DOCTYPE html&gt;？</p>\n<p class=\"a post-p\">HTML5 不基于 SGML，所以不需要引用 DTD。</p>\n\n<p class=\"q\">行内元素有哪些？块级元素有哪些？ 空(void)元素有那些？</p>\n<p class=\"a post-p\">首先说明: 行内元素和块级元素针对display的默认值而言, VOID 元素则是标签在一对尖括号内关闭(/)的元素。</p>\n<pre class=\"code-border\"><code>\n（1）行内元素有：a b span img input select strong\n（2）块级元素有：div ul ol li dl dt dd h1 h2 h3 h4… p\n\n（3）常见的空元素：\n    br hr img input link meta\n    鲜为人知的是：\n    area base col command embed keygen param source track wbr\n                </code></pre>\n<p class=\"a post-p\"><a href=\"../misc/examples/element_type.html\" class=\"ex\" target=\"_blank\">元素类型: 行内元素上下补丁无效</a></p>\n\n<p class=\"q\">页面导入样式时，使用link和@import有什么区别？</p>\n<p class=\"a post-p\">link属于XHTML标签，除了加载CSS外，还能用于定义RSS, 定义rel连接属性等作用；而@import是CSS提供的，只能用于加载CSS。</p>\n<p class=\"a post-p\">link中定义的CSS文件会有按照加载次序的覆盖效果, 而@import加载的CSS不会覆盖link加载的CSS, 似乎在优先级上有区别。</p>\n<p class=\"a post-p\"><a href=\"../misc/examples/import_load.html\" class=\"ex\" target=\"_blank\">@import加载时机</a></p>\n\n<p class=\"q\">介绍一下你对浏览器内核的理解？</p>\n<p class=\"a post-p\">与内核相对的是壳(shell), 我曾使用过KDE系统, Linux下最炫酷的shell。浏览器的内核分两个主要组成部分, 渲染引擎和JS引擎。</p>\n<p class=\"a post-p\">渲染引擎负责获取网页内容, 及I/O部分; 计算样式, 显示内容。</p>\n<p class=\"a post-p\">JS引擎比如谷歌浏览器的V8引擎, 负责高效地执行Javascript脚本。</p>\n<p class=\"a post-p\">就浏览器来说，互联网经历了十年的高速发展期，近几年市场上也推出了很多新的浏览器，但是他们并非是采用自主开发的内核，所以浏览器内核本身实际没有实质突破。</p>\n\n<p class=\"q\">常见的浏览器内核有哪些？</p>\n<p class=\"a post-p\">Trident内核：IE,MaxThon,TT,The World,360,搜狗浏览器等。[又称MSHTML]</p>\n<p class=\"a post-p\">Gecko内核：Netscape6及以上版本，FF,MozillaSuite/SeaMonkey等</p>\n<p class=\"a post-p\">Presto内核：Opera7及以上。 [Opera内核原为：Presto，现为：Blink;]</p>\n<p class=\"a post-p\">Webkit内核：Safari,Chrome等。 [ Chrome的：Blink（WebKit的分支）]</p>\n\n<p class=\"q\">html5有哪些新特性、移除了那些元素？如何处理HTML5新标签的浏览器兼容问题？如何区分 HTML 和 HTML5？</p>\n<p class=\"a post-p\">HTML5 现在已经不是 SGML 的子集，主要是关于图像，位置，存储，多任务等功能的增加。</p>\n<ul class=\"post-l\">\n  <li>绘画 canvas</li>\n  <li>用于媒介回放的 video 和 audio 元素</li>\n  <li>本地离线存储 localStorage 长期存储数据，浏览器关闭后数据不丢失</li>\n  <li>sessionStorage 的数据在浏览器关闭后自动删除</li>\n  <li>语意化更好的内容元素，比如 article、footer、header、nav、section</li>\n  <li>表单控件，calendar、date、time、email、url、search</li>\n  <li>新的技术web worker, web socket, GeoLocation</li>\n</ul>\n<p class=\"a post-p\"><a href=\"https://aarontgrogg.com/blog/2015/07/20/the-difference-between-service-workers-web-workers-and-websockets/\" class=\"ex\"\n    target=\"_blank\">service worker, web worker, web socket的异同</a></p>\n<p class=\"a post-p\">移除的元素：</p>\n<ul class=\"post-l\">\n  <li>纯表现的元素：basefont，big，center，font, s，strike，tt，u</li>\n  <li>对可用性产生负面影响的元素：frame，frameset，noframes</li>\n</ul>\n<p class=\"a post-p\">支持HTML5新标签：IE8/IE7/IE6支持通过document.createElement方法产生的标签， 可以利用这一特性让这些浏览器支持HTML5新标签， 浏览器支持新标签后，还需要添加标签默认的样式。 当然也可以直接使用成熟的框架、比如html5shim;\n</p>\n<pre class=\"code-border\"><code>\n&lt;!--[if lt IE 9]&gt;\n&lt;script src = \"http://html5shim.googlecode.com/svn/trunk/html5.js\"&gt;&lt;/script&gt;\n&lt;![endif]--&gt;\n  </code></pre>\n<p class=\"a post-p\">如何区分HTML5： 根据以上介绍的新特性, 另简单的一点doctype。</p>\n\n<p class=\"q\">简述一下你对HTML语义化的理解？</p>\n<p class=\"a post-p\">从网页开发人员的角度讲, 非语义化的局面所描述的一种极端情况是用一个标签, 加上不同的class CSS来实现所有控件。 我想这是语义化的初衷, 因为极端情况下实现起来看似牛逼, 实则心累啊。</p>\n<p class=\"a post-p\">从处理语义化文档的程序的角度讲, 又是给另一部分开发人员解放了心灵。</p>\n\n<p class=\"q\">HTML5的离线储存怎么使用，工作原理能不能解释一下？浏览器是怎么对HTML5的离线储存资源进行管理和加载的呢？</p>\n<p class=\"a post-p\"><a href=\"../misc/examples/offline-cache.html\" class=\"ex\" target=\"_blank\">离线存储小实例</a></p>\n<p class=\"a post-p\">离线存储的原理大致是浏览器解析html标签的manifest属性后, 将需要缓存的文件的ETag或者Last-Modify Time请求到本机对比。manifest属性是对一个html文件的定制, 对缓存的定制不受浏览器disable cache设置的影响。</p>\n\n<p class=\"q\">请描述一下 cookies，sessionStorage 和 localStorage 的区别？</p>\n<p class=\"a post-p\">cookies是一小段文本为内容的文件, 一般文件名作为键, 文件内容作为值。 sessionStorage 和 localStorage 为键值对管理工具, 其中 sessionStorage 的内容在页面关闭时清除。</p>\n\n<p class=\"q\">iframe有那些缺点？</p>\n<p class=\"a post-p\">在我的<a href=\"https://caoyouxin.gitbooks.io/pageslider/content/\" class=\"\" target=\"_blank\">框架</a>中正是使用了iframe, 恰恰利用了iframe提供页面内嵌页面的逻辑。缺点不再赘述,\n  坑是要慢慢躺的。\n</p>\n\n<p class=\"q\">Label的作用是什么？是怎么用的？（加 for 或 包裹）</p>\n<p class=\"a post-p\">语义化。<a href=\"../misc/examples/labels.html\" class=\"ex\" target=\"_blank\">请查看源代码</a></p>\n\n<p class=\"q\">HTML5的form如何关闭自动完成功能？</p>\n<p class=\"a post-p\">设置autocomplete属性</p>\n\n<p class=\"q\">如何实现浏览器内多个标签页之间的通信? (阿里)</p>\n<p class=\"a post-p\">localStorage, cookies, 后端接口调用。</p>\n\n<p class=\"q\">webSocket如何兼容低浏览器？(阿里)</p>\n<p class=\"a post-p\">使用AS3, 前前公司的游戏用的就是它。</p>\n\n<p class=\"q\">页面可见性（Page Visibility）API 可以有哪些用途？</p>\n<p class=\"a post-p\">这个什么鬼API在MDN上搜不到, 怀疑又是什么鬼编造出来的名词。CSS中控制可见性的属性有display, filter, visibility, 如果背景也算的话, 还包括background, box-shadow。</p>\n\n<p class=\"q\">如何在页面上实现一个圆形的可点击区域？</p>\n<p class=\"a post-p\">border-radius。<a href=\"#/article;n=每个人的生存环境\" class=\"ex\" target=\"_blank\">请查看示例</a></p>\n\n<p class=\"q\">实现不使用 border 画出1px高的线，在不同浏览器的Quirksmode和CSSCompat模式下都能保持同一效果。</p>\n<p class=\"a post-p\">height, background-color, display</p>\n\n<p class=\"q\">网页验证码是干嘛的，是为了解决什么安全问题？</p>\n<p class=\"a post-p\">为了防止机器自动填充密码, 非法登录用户账号。</p>\n\n<p class=\"q\">title与h1的区别、b与strong的区别、i与em的区别？</p>\n<p class=\"a post-p\">title是整个网页文件的标题, 写在head里, 常出现在浏览器标签的文本里; h1是网页内容文本中的标题。</p>\n<p class=\"a post-p\">b是物理状态, 粗体; strong是逻辑状态, 只是默认显示为粗体。如果给b标签的显示用css修改为其它形式, 就会引起逻辑上的混乱。</p>\n<p class=\"a post-p\">i同样是物理状态, 斜体; em同样是逻辑状态, 而且具有语义性质, 例如在朗读过程中, em标签的内容会设置为重音。</p>";

/***/ }),
/* 16 */
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