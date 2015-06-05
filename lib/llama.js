/*
 * Copyright 2015 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */
 
module.exports = function (mlf) {
    'use strict'
    
    var formatter = {
        block : function (tagName, attr, elements) {
			return this.open_block(tagName, attr) + this.children(elements) + this.close_block(tagName)
		},
        open_block: function (tagName, attr) { return '<' + tagName + (typeof attr !== 'undefined' ? this.tag_attr(attr) : '') + '>' },
        tag_attr: function(attr) {
			var ks = Object.keys(attr);
			if (ks.length === 0) return '';
			return ' ' + mlf(ks).map(function (k) {
				var v = attr[k];
				if (k==='_') k = 'class';
				return k + '="' + (typeof v === 'function' ? v(this) : v)  + '"'
			}).get().join(' ')
		},
        close_block: function (tagName) { return '</' + tagName + '>' },
        children : function (elements) { return mlf(elements).map(parse).get().join('') }
    }
    
    function parse(o) {
		switch (typeof o) {
		case 'function':
			return o()
		case 'string':
			return o;
        default:
            return String(o);
        }
    }
    
    function build_block(tagName) {
        return function () {
            var attr, v = Array.prototype.slice.call(arguments)
            if (typeof v[0] === 'object') attr = v.shift()
            return function() {
                return formatter.block(tagName, attr, mlf(v).map(parse).get())
            }
        }
    }
    
    function build_single(tagName) {
        return function () {
            var attr, v = Array.prototype.slice.call(arguments)
            if (typeof v[0] === 'object') attr = v.shift()
            return function() {
                return formatter.open_block(tagName, attr)
            }
        }
    }
    
    function each() {
        var v = Array.prototype.slice.call(arguments)
        var arr = v.shift(), k = ''
        if (! (arr instanceof Array)) {
            if (typeof arr === 'function') {
                arr = arr()
            } else {
                k = Object.keys(arr)[0]
                arr = arr[k]
                if (typeof arr === 'function') {
                    arr = arr()
                }
            }
        }
        var that = this
		return function() {
            return function() {
                //console.log('each',k, arr)
                return formatter.children(
                    mlf(arr).map(function(e) {
                        var c = {}
                        c[k] = e
                        that._.push(c) 
                        //console.log('k: "'+k+'" e: '+e)
                        //console.log('k: "'+k+'" e: '+e, v.map(function(f){if (typeof f === 'function') return f.toString(); else return f }))
                        var r = formatter.children(mlf(v).map(parse).get())
                        that._.pop() 
                        return r
                    }).get()
                )
            }
		}
	}
    
    function context(context) {
		this._ = []
        if (typeof context !== 'undefined') this._.push(context)
	}
    function register(dol) {
		//console.log("reg:", dol);
		var k = dol.substr(1)
		this[dol] = function() {
            return function() {
                var res = mlf(this._).reduceRight(function(p, c) {
                    if (typeof p === 'undefined' && k in c) return c[k];
                    return p;
                }, undefined);
                //console.log(dol+" res["+k+"]",res, this._);
                return res;                
            }.bind(this)
		}
	}
    
    var blocks = [
        'html', 'head', 
        'title', 'script', 'noscript', 'style',
        'body', 'div', 'pre', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'dl', 'dt', 'dd', 'ul', 'ol', 'li',
        'del', 'ins', 'a', 'abbr', 'dfn', 'em', 'strong', 'sub', 'sup',
        'b', 'i', 'u', 's', 'tt',
        'form', 'button', 'fieldset', 'label', 'legend', 'select', 'option', 'optgroup', 'textarea',
        'table', 'thead', 'tbody', 'tfoot', 'th', 'tr', 'td', 'col', 'colgroup', 'caption',
        'address', 'blockquote', 'center', 'code','map', 'object', 'iframe'
    ];
    var single = [ 'base', 'link', 'meta', 'hr', 'br', 'area', 'param', 'input', 'img' ];

    var funRx = /function\s*(\w*)\s*\(([^)]*?)\)\s*\{([\s\S]*)\}/m
    var tagRx = new RegExp('(\\$[_a-zA-Z0-9]*)\\s*\\(|((?:each|'+blocks.join('|')+'|'+single.join('|')+'))\\s*\\(','gm')
    
    function compile(descr) {
        var tags = {}
        mlf(blocks).forEach(function (e) { tags[e] =  build_block(e).bind(tags) });
        mlf(single).forEach(function (e) { tags[e] =  build_single(e).bind(tags) });
        tags.each = each.bind(tags);
        tags.context = context.bind(tags);
        tags.register = register.bind(tags);
        
        var res
        descr.toString().replace(funRx, function(_0, name, param, body) {
            body = body.replace(tagRx, function(_0, dol, param) {
				if (typeof dol !== "undefined") {
					tags.register(dol)
					return 'tags.'+dol+'('
				} else if (typeof param !== "undefined") {
					return 'tags.'+param+'('
				}
			})
            body = 'return function(context) {\n tags.context(context);return (function(){'+body+'})()();\n }'
            //console.log(body)
			var f = new Function('tags', body)
			res = f(tags)
        })
        return res
    }
    
    return compile
}
