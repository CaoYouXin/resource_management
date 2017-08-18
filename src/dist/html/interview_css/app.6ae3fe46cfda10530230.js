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

window.handlers = {
  drawClicked: function (e) {
    e.target.classList.toggle('active');
  }
};

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
		module.hot.accept("!!../../html/interview_css/node_modules/.0.28.5@css-loader/index.js!./default.css", function() {
			var newContent = require("!!../../html/interview_css/node_modules/.0.28.5@css-loader/index.js!./default.css");
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
		module.hot.accept("!!../html/interview_css/node_modules/.0.28.5@css-loader/index.js!./all.css", function() {
			var newContent = require("!!../html/interview_css/node_modules/.0.28.5@css-loader/index.js!./all.css");
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
		module.hot.accept("!!../html/interview_css/node_modules/.0.28.5@css-loader/index.js!./post.css", function() {
			var newContent = require("!!../html/interview_css/node_modules/.0.28.5@css-loader/index.js!./post.css");
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
		module.hot.accept("!!../html/interview_css/node_modules/.0.28.5@css-loader/index.js!./post-code.css", function() {
			var newContent = require("!!../html/interview_css/node_modules/.0.28.5@css-loader/index.js!./post-code.css");
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

module.exports = "<p class=\"q\">介绍一下标准的CSS的盒子模型？与低版本IE的盒子模型有什么不同的？</p>\n<p class=\"a post-p\">也就是CSS3中的box-sizing属性的content-box和border-box, 其中后者为低版本IE的盒子模型。</p>\n\n<p class=\"q\">CSS选择符有哪些？哪些属性可以继承？</p>\n<ol class=\"post-l\">\n  <li>*</li>\n  <li>#X</li>\n  <li>.X</li>\n  <li>X Y</li>\n  <li>X</li>\n  <li>X:visited and X:link</li>\n  <li>X + Y</li>\n  <li>X > Y</li>\n  <li>X ~ Y</li>\n  <li>X[attr]</li>\n  <li>X[attr=\"foo\"]</li>\n  <li>X[attr*=\"mid\"]</li>\n  <li>X[attr^=\"start\"]</li>\n  <li>X[attr$=\"end\"]</li>\n  <li>X[attrStart-*=\"foo\"]</li>\n  <li>X[foo~=\"bar\"]&nbsp;&nbsp;&nbsp;&nbsp;a spaced-separated list of values</li>\n  <li>X:checked</li>\n  <li>X:before</li>\n  <li>X:after</li>\n  <li>X:hover</li>\n  <li>X:not(selector)</li>\n  <li>X::pseudoElement&nbsp;&nbsp;first-letter&nbsp;&nbsp;first-line</li>\n  <li>X:nth-child(n)</li>\n  <li>X:nth-last-child(n)</li>\n  <li>X:nth-of-type(n)</li>\n  <li>X:nth-last-of-type(n)</li>\n  <li>X:first-child</li>\n  <li>X:last-child</li>\n  <li>X:only-child</li>\n  <li>X:only-of-type</li>\n  <li>X:first-of-type</li>\n  <li>X:last-of-type</li>\n</ol>\n<ul class=\"post-l\">\n  <li>\n    不可继承的：display、margin、border、padding、background、height、min-height、max-height、width、min-width、max-width、overflow、position、left、right、top、bottom、z-index、float、clear、table-layout、vertical-align、page-break-after、page-break-before和unicode-bidi。\n  </li>\n  <li>所有元素可继承：visibility和cursor。</li>\n  <li>\n    内联元素可继承：letter-spacing、word-spacing、white-space、line-height、color、font、font-family、font-size、font-style、font-variant、font-weight、text-decoration、text-transform、direction。\n  </li>\n  <li>终端块状元素可继承：text-indent和text-align。</li>\n  <li>列表元素可继承：list-style、list-style-type、list-style-position、list-style-image。</li>\n</ul>\n\n<p class=\"q\">CSS优先级算法如何计算？</p>\n<ul class=\"post-l\">\n  <li>元素标签中定义的样式（Style属性）,加1,0,0,0</li>\n  <li>每个ID选择符(如 #id),加0,1,0,0</li>\n  <li>每个Class选择符(如 .class)、每个属性选择符(如 [attribute=])、每个伪类(如 :hover)加0,0,1,0</li>\n  <li>每个元素选择符（如p）或伪元素选择符(如 :firstchild)等，加0,0,0,1</li>\n  <li>然后，将这四个数字分别累加，就得到每个CSS定义的优先级的值，</li>\n  <li>然后从左到右逐位比较大小，数字大的CSS样式的优先级就高。</li>\n  <li>!important声明的样式优先级最高，如果冲突再进行计算。</li>\n  <li>如果优先级相同，则选择最后出现的样式。</li>\n  <li>继承得到的样式的优先级最低。</li>\n  <li>Universal selector (*), combinators (+, >, ~, ' ') and negation pseudo-class (:not()) have no effect on specificity. (The\n    selectors declared <em>inside</em> :not() do, however.)\n  </li>\n</ul>\n\n<p class=\"q\">CSS3新增伪类有那些？</p>\n<p class=\"a post-p\">这一块真是百思不得其解。<a href=\"https://developer.mozilla.org/en-US/Learn/CSS/Introduction_to_CSS/Selectors/Pseudo-classes_and_pseudo-elements\"\n    target=\"_blank\">MDN关于pseudo-classes和pseudo-elements的说明</a></p>\n\n<p class=\"q\">如何居中div？如何居中一个浮动元素？如何让绝对定位的div居中？</p>\n<pre class=\"code-border\"><code>\n.v-mid-box {\n  text-align: center;\n}\n\n.v-mid-box > *, .v-mid-box:after {\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.v-mid-box:after {\n  content: '';\n  width: 0;\n  height: 100%;\n}\n</code></pre>\n\n<p class=\"q\">display有哪些值？说明他们的作用。</p>\n<p class=\"a post-p\">none | inline | block | list-item | inline-list-item | inline-block | inline-table | table | table-cell | table-column |\n  table-column-group | table-footer-group | table-header-group | table-row | table-row-group | flex | inline-flex | grid\n  | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents</p>\n<p class=\"a post-p\">按inline、block可分为两类。按照table、flex、ruby可分为三类。当然还有最新的值揉合inline和block。</p>\n\n<p class=\"q\">position的值relative和absolute定位原点是？</p>\n<p class=\"a post-p\">relative的定位原点在元素本来应该出现的位置上。</p>\n<p class=\"a post-p\">absolute的定位原点在父元素的左上角, 如果 <em>所有</em> 父元素都没有设置position, 那么定位原点在body元素的左上角。</p>\n\n<p class=\"q\">CSS3有哪些新特性？</p>\n<ul class=\"post-l post-drawer-l\">\n  <li onclick=\"handlers.drawClicked(event);\">CSS3选择器</li>\n  <li onclick=\"handlers.drawClicked(event);\">@font-face</li>\n  <li onclick=\"handlers.drawClicked(event);\">word-wrap、text-overflow</li>\n  <li onclick=\"handlers.drawClicked(event);\">Text-decoration\n    <div class=\"hidden\">\n      <p class=\"a post-p\">text-fill-color、text-stroke-color、text-stroke-width</p>\n    </div>\n  </li>\n  <li onclick=\"handlers.drawClicked(event);\">Multi-column Layout\n    <div class=\"hidden\">\n      <p class=\"a post-p\">column-count、column-rule、column-gap</p>\n    </div>\n  </li>\n  <li onclick=\"handlers.drawClicked(event);\">边框和颜色</li>\n  <li onclick=\"handlers.drawClicked(event);\">渐变效果\n    <div class=\"hidden\">\n      <p class=\"a post-p\">线性渐变、径向渐变</p>\n    </div>\n  </li>\n  <li onclick=\"handlers.drawClicked(event);\">阴影和反射效果\n    <div class=\"hidden\">\n      <p class=\"a post-p\">文字阴影、盒子阴影（一个div绘制一副画）</p>\n    </div>\n  </li>\n  <li onclick=\"handlers.drawClicked(event);\">背景效果\n    <div class=\"hidden\">\n      <p class=\"a post-p\">background-clip、background-origin、background-size、background-break</p>\n      <p class=\"a post-p\">多背景图片</p>\n    </div>\n  </li>\n  <li onclick=\"handlers.drawClicked(event);\">盒子模型（牛X的flex盒子）\n    <div class=\"hidden\">\n      <p class=\"a post-p\">flex-direction、flex-wrap、flex-grow、flex-shrink、flex-basis、flex-flow</p>\n    </div>\n  </li>\n  <li onclick=\"handlers.drawClicked(event);\">动画\n    <div class=\"hidden\">\n      <p class=\"a post-p\">\n        transition-property、transition-duration、transition-delay、transition-timing-function</p>\n      <p class=\"a post-p\">transform: skew、scale、rotate、translate</p>\n    </div>\n  </li>\n</ul>\n<p class=\"a post-p\"><a href=\"http://www.ibm.com/developerworks/cn/web/1202_zhouxiang_css3/\" class=\"ex\" target=\"_blank\">外链文章</a></p>\n\n<p class=\"q\">请解释一下CSS3的Flexbox（弹性盒布局模型）,以及适用场景？</p>\n<p class=\"a post-p\">\n  弹性盒模型可以用简单的方式满足很多常见的复杂的布局需求。它的优势在于开发人员只是声明布局应该具有的行为，而不需要给出具体的实现方式。浏览器会负责完成实际的布局。该布局模型在主流浏览器中都得到了支持。</p>\n<p class=\"a post-p\">应用场景例如图片展示（格子拼图）、柱状图; （个人认为display属性分几大派系, 每一派系都能撑起一片天。）</p>\n<p class=\"a post-p\"><a href=\"http://www.ibm.com/developerworks/cn/web/1409_chengfu_css3flexbox/\" class=\"ex\" target=\"_blank\">外链文章</a></p>\n\n<p class=\"q\">用纯CSS创建一个三角形的原理是什么？</p>\n<p class=\"a post-p\">CSS中border分8块, 通过颜色和none隐藏的手段,创建8种方位的三角形。</p>\n\n<p class=\"q\">一个满屏 品 字布局 如何设计?</p>\n<p class=\"a post-p\">百分比确定宽度, float漂浮。或者, 使用弹性盒子布局。</p>\n\n<p class=\"q\">常见兼容性问题？</p>\n<p class=\"a post-p\">解决兼容性问题有两条思路, 一是使用某些浏览器不支持的语法; 二是使用带浏览器前缀的属性和值。</p>\n\n<p class=\"q\">li与li之间有看不见的空白间隔是什么原因引起的？有什么解决办法？</p>\n<p class=\"a post-p\">本来不理解这个问题, 经百度, 这是将li设置为内联块元素后出现的问题。实际上, 对所有内联元素布局时都会有这个问题。</p>\n<p class=\"a post-p\">我们一般写代码都是带缩进的, HTML中多个空格会当做一个空格处理, 因此这是由字体大小导致的。修复时可以讲ul或ol字体大小设置为0px, 但是不要忘了设置li字体大小, 因为font-size在内联元素中是可继承的。\n</p>\n\n<p class=\"q\">经常遇到的浏览器的兼容性有哪些？原因，解决方法是什么，常用hack的技巧 ？</p>\n<ul class=\"post-l post-drawer-l\">\n  <li onclick=\"handlers.drawClicked(event);\">浏览器默认的margin和padding不同。解决方案是加一个全局的*{margin:0;padding:0;}来统一。</li>\n  <li onclick=\"handlers.drawClicked(event);\">IE6双边距 将其转化为行内属性。</li>\n  <li onclick=\"handlers.drawClicked(event);\">在ie6，ie7中元素高度超出自己设置高度。原因是IE8以前的浏览器中会给元素设置默认的行高的高度导致的。解决方案是加上overflow:hidden或设置line-height为更小的高度。</li>\n  <li onclick=\"handlers.drawClicked(event);\">min-height在IE6下不起作用。解决方案是添加 height:auto !important;height:xxpx;其中xx就是min-height设置的值。</li>\n  <li onclick=\"handlers.drawClicked(event);\">透明性IE用filter:Alpha(Opacity=60)，而其他主流浏览器用 opacity:0.6;</li>\n  <li onclick=\"handlers.drawClicked(event);\">\n    ie6的默认CSS样式，涉及到border的有border-style:inset;border-width:2px;浏览器根据自己的内核解析规则，先解析自身的默认CSS，再解析开发者书写的CSS，达到渲染标签的目的。IE6对INPUT的渲染存在bug，border:none;不被解析，当有border-width或border-color设置的时候才会令IE6去解析border-style:none;。\n    <div class=\"hidden\">\n      <p class=\"a post-p\">a(有href属性)标签嵌套下的img标签，在IE下会带有边框。解决办法是加上a img{border:none;}样式。</p>\n      <p class=\"a post-p\">input边框问题。去掉input边框一般用border:none;就可以，但由于IE6在解析input样式时的BUG(优先级问题)，在IE6下无效。</p>\n      <p class=\"a post-p\">解决方案是用:border:0或border:0 none;或border:none:border-color:transparent;，推荐用第三种方案。</p>\n    </div>\n  </li>\n  <li onclick=\"handlers.drawClicked(event);\">父子标签间用margin的问题，表现在有时除IE(6/7)外的浏览器子标签margin转移到了父标签上，IE6&7下没有转移。\n    <div class=\"hidden\">\n      <p class=\"a post-p\">解决办法就是父子标签间的间隔建议用padding，兄弟标签间用margin。</p>\n      <p class=\"a post-p\">另外一个解决办法是, 转化为BFC, 即overflow: hidden;</p>\n    </div>\n  </li>\n  <li onclick=\"handlers.drawClicked(event);\">父子关系的标签，子标签浮动导致父标签不再包裹子标签。\n    <div class=\"hidden\">\n      <p class=\"a post-p\">清除浮动</p>\n      <p class=\"a post-p\">转化为BFC</p>\n    </div>\n  </li>\n</ul>\n\n<p class=\"q\">为什么要初始化CSS样式? </p>\n<p class=\"a post-p\">我使用的是 normalize.min.css 。可以使各浏览器对相同的元素作出一致的表现。</p>\n\n<p class=\"q\">absolute的containing block计算方式跟正常流有什么不同？</p>\n<p class=\"a post-p\">正常流cb为就近的父元素的content box（除margin,border,padding外的区域）</p>\n<p class=\"a post-p\">absolute的cb则是找到其祖先元素中最近的position属性非static的元素, 然后判断。</p>\n\n<p class=\"q\">CSS里的visibility属性有个collapse属性值是干嘛用的？在不同浏览器下以后什么区别？</p>\n<p class=\"a post-p\">这个属性值是为了快速移除行列而设计的, 移除过程中不用计算全部表格。应用在表格里的显示效果与display: none;一致。</p>\n<p class=\"a post-p\">对于其它元素, 显示效果与visibility: hidden;一致, 即留出空白区域。</p>\n<p class=\"a post-p\">不过, 谷歌浏览器中似乎collapse与hidden一致。</p>\n\n<p class=\"q\">position跟display、margin collapse、overflow、float这些特性相互叠加后会怎么样？</p>\n<p class=\"a post-p\">首先overflow: hidden;会构建一个新的BFC, 可以包含浮动元素。</p>\n<p class=\"a post-p\">display: none;会使元素彻底消失, margin也会消失。</p>\n<p class=\"a post-p\">float相当于z-index上高出一级的位置上重新开始排列。</p>\n\n<p class=\"q\">对BFC规范(块级格式化上下文：block formatting context)的理解？</p>\n<p class=\"a post-p\">简单来说，BFC 就是一种属性，这种属性会影响着元素的定位以及与其兄弟元素之间的相互作用。</p>\n<p class=\"a post-p\">IE6-7 并不支持 W3C 的 BFC ，而是使用私有属性 hasLayout 。从表现上来说，hasLayout 跟 BFC 很相似。使用 zoom: 1 既可以触发 hasLayout 又不会对元素造成其他影响，相对来说会更为方便。\n</p>\n<p class=\"a post-p\">满足下面任一条件的元素，会触发为 BFC ：</p>\n<ul class=\"post-l\">\n  <li>浮动元素，float 除 none 以外的值</li>\n  <li>绝对定位元素，position（absolute，fixed）</li>\n  <li>display 为以下其中之一的值 inline-blocks，table-cells，table-captions</li>\n  <li>overflow 除了 visible 以外的值（hidden，auto，scroll）</li>\n</ul>\n\n<p class=\"q\">请解释一下为什么会出现浮动和什么时候需要清除浮动？清除浮动的方式</p>\n<p class=\"a post-p\">浮动提供一种布局方式, 可以很方便的实现品字布局以及其它布局。</p>\n<p class=\"a post-p\">简单说, 需要换行的时候需要通过清除浮动来完成。</p>\n<p class=\"a post-p\">清除浮动有两种方式:</p>\n<ul class=\"post-l\">\n  <li>在浮动元素后, 追加一个元素, 样式中加入clear: both;。追加的元素可以是伪元素。</li>\n  <li>在父元素上构建BFC</li>\n</ul>\n\n<p class=\"q\">移动端的布局用过媒体查询吗？</p>\n<p class=\"a post-p\">媒体查询几乎是写两套CSS, 不如使用flexbox, 在设计上多下功夫。</p>\n\n<p class=\"q\">使用 CSS 预处理器吗？喜欢那个？</p>\n<p class=\"a post-p\">并没有使用过 CSS 预处理器, 喜欢自行设计选择器结构。</p>\n<p class=\"a post-p\">另外, 使用过 CSS 压缩、合并插件。</p>\n\n<p class=\"q\">CSS优化、提高性能的方法有哪些？</p>\n<p class=\"a post-p\">说到性能, 不得不提开发速度与代码可维护性。关于这些, 就之前的开发实践, 认为应该向semantic ui学习, 即将常用 CSS 功能作合理归类、拆分, 平时多积累, 这样才是写 CSS 的道路。\n</p>\n\n<p class=\"q\">浏览器是怎样解析CSS选择器的？</p>\n<p class=\"a post-p\">解析 CSS 选择器离不开 HTML 的特性, ID唯一, class可以应用在多个标签上。所以, 解析过程先从ID开始, 然后从左至右。</p>\n\n<p class=\"q\">在网页中的应该使用奇数还是偶数的字体？为什么呢？</p>\n<p class=\"a post-p\">偶数的多吧, 这个多是设计人员决定的。</p>\n\n<p class=\"q\">margin和padding分别适合什么场景使用？</p>\n<p class=\"a post-p\">margin多用在边框外边距, 相反padding多用在边框内边距。</p>\n\n<p class=\"q\">抽离样式模块怎么写，说出思路，有无实践经验？[阿里航旅的面试题]</p>\n<p class=\"a post-p\">模仿semantic ui, 首先可以抽出数字作为 class 的选择器。另外一条思路可以是根据开发中的新型界面抽离。</p>\n\n<p class=\"q\">元素竖向的百分比设定是相对于容器的高度吗？</p>\n<p class=\"a post-p\">对于 padding-top,padding-bottom,margin-top,margin-bottom， 貌似是宽度。</p>\n\n<p class=\"q\">全屏滚动的原理是什么？用到了CSS的那些属性？</p>\n<p class=\"a post-p\">滚动用到transform: translate(); overflow: hidden;</p>\n<p class=\"a post-p\">记得大二时，连这个效果都没有实现就给院长献丑了，真是不逢时啊！</p>\n\n<p class=\"q\">什么是响应式设计？响应式设计的基本原理是什么？如何兼容低版本的IE？</p>\n<p class=\"a post-p\">即能够适应不同屏幕尺寸的页面设计, 基本原理是使用媒体查询。低版本IE可以使用JS来实现媒体查询的功能。</p>\n\n<p class=\"q\">视差滚动效果，如何给每页做不同的动画？（回到顶部，向下滑动要再次出现，和只出现一次分别怎么做？）</p>\n<p class=\"a post-p\">没做过, 看是看得出, 这是件体力活。</p>\n\n<p class=\"q\">::before 和 :after中双冒号和单冒号 有什么区别？解释一下这2个伪元素的作用。</p>\n<p class=\"a post-p\">双冒号是伪元素, 单冒号是伪类。对于before和after这两种写法作用一样。</p>\n\n<p class=\"q\">如何修改chrome记住密码后自动填充表单的黄色背景 ？</p>\n<p class=\"a post-p\">input:-webkit-autofill</p>\n\n<p class=\"q\">你对line-height是如何理解的？</p>\n<p class=\"a post-p\">是个对inline元素以及inline元素内文本进行垂直居中的好属性。</p>\n\n<p class=\"q\">设置元素浮动后，该元素的display值是多少？（自动变成display:block）</p>\n<p class=\"a post-p\">好神奇, 这可能是BFC的作用。</p>\n\n<p class=\"q\">怎么让Chrome支持小于12px 的文字？</p>\n<p class=\"a post-p\">-webkit-transform: scale();</p>\n\n<p class=\"q\">让页面里的字体变清晰，变细用CSS怎么做？（-webkit-font-smoothing: antialiased;）</p>\n<p class=\"a post-p\">反锯齿</p>\n\n<p class=\"q\">font-style属性可以让它赋值为“oblique” oblique是什么意思？</p>\n<p class=\"a post-p\">人工倾斜版本, 另外两个值是normal、italic, 正常版本和斜体版本</p>\n\n<p class=\"q\">position:fixed;在android下无效怎么处理？</p>\n<p class=\"a post-p\">没遇到过这个问题哦, 百度了一下, viewport设置好了就OK。</p>\n\n<p class=\"q\">如果需要手动写动画，你认为最小时间间隔是多久，为什么？（阿里）</p>\n<p class=\"a post-p\">多数显示器默认频率是60Hz，即1秒刷新60次，所以理论上最小间隔为1/60＊1000ms ＝ 16.7ms</p>\n\n<p class=\"q\">display:inline-block 什么时候会显示间隙？(携程)</p>\n<p class=\"a post-p\">父容器字体大小不为0。</p>\n\n<p class=\"q\">overflow: scroll时不能平滑滚动的问题怎么处理？</p>\n<p class=\"a post-p\">老实说, 没遇到这种情况, 看出平滑滚动对眼睛的考验蛮高的。这里记下网上的解答思路, 阻止所有能导致页面滚动的事件。</p>\n\n<p class=\"q\">有一个高度自适应的div，里面有两个div，一个高度100px，希望另一个填满剩下的高度。</p>\n<p class=\"a post-p\">选定盒模型, 有两条思路, 补丁互补, 绝对定位。</p>\n\n<p class=\"q\">png、jpg、gif 这些图片格式解释一下，分别什么时候用。有没有了解过webp？</p>\n<p class=\"a post-p\">png支持透明背景; jpg格式文件小, 下载快; gif支持动画。webp是谷歌推出的文件格式, 并没有深入了解。</p>\n\n<p class=\"q\">style标签写在body后与body前有什么区别？</p>\n<p class=\"a post-p\">页面加载自上而下 当然是先加载样式。</p>";

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