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
 
module.exports = function (mlf, extend) {
    'use strict'
    
    function Llama() {
		if (!(this instanceof Llama)) return new Llama()
		
	}
    
    /**
     * instantiate LlamaVar with initial value
     */
    Llama.prototype.$ = function(v) {
		if (typeof v === 'object') {
			if (v instanceof Array) {
				return LlamaArray(v)
			}
		}
		return LlamaVar(v)
	}
    function LlamaVar(v) {
		if (!(this instanceof LlamaVar)) {
			var x = new LlamaVar(v)
			var r = LlamaVar.prototype.fun.bind(x)
			return r
		}
		this.v = v
	}
	LlamaVar.prototype.val = function() {
		if (arguments.length === 0) return this.v
		this.v = arguments[0]
	}
	LlamaVar.prototype.fun = function() {
		if (arguments.length === 0) return this;
	}
	
	function LlamaArray(v) {
		if (!(this instanceof LlamaArray)) {
			var x = new LlamaArray(v)
			var r = LlamaVar.prototype.fun.bind(x)
			r.each = LlamaArray.prototype.each.bind(x)
			r._v = LlamaArray.prototype._v.bind(x)
			return r
		}
		this.v = v
	}
	LlamaArray.prototype = Object.create(LlamaVar.prototype)
	LlamaArray.prototype.each = function() {
		this.c = Array.prototype.slice.call(arguments)
		return this
	}
	LlamaArray.prototype.val = function() {
		var curr
		if ('curr' in this && this.curr instanceof LlamaArrayVal) {
			curr = this.curr
		} else {
			curr = {val: function(){}}
		}
		return mlf(this.v).map(function(v) {
			curr.val(v)
			this.renewChildrenUid()
			return this.renderChildren()
		}.bind(this)).get().join('')
	}
	LlamaArray.prototype.renderChildren = renderChildren
	LlamaArray.prototype.renewChildrenUid = function() {
		mlf(this.c).forEach(function(c) {
			if (c instanceof LlamaTag) c.renewUid()
		})
	}
	LlamaArray.prototype._v = function () {
		var r = new LlamaArrayVal(this)
		this.curr = r
		return r
	}
	
	function LlamaArrayVal() {}
	LlamaArrayVal.prototype = Object.create(LlamaVar.prototype)

	/**
	 * tags management functions
	 */
	function $$() {
		var a = Array.prototype.slice.call(arguments)
        var t = a.shift()
        return new LlamaTag(t, a)
	}
	Llama.prototype.$$ = $$;
	
	var tags = [
		// open-close
        'html', 'head', 
        'title', 'script', 'noscript', 'style',
        'body', 'div', 'pre', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'dl', 'dt', 'dd', 'ul', 'ol', 'li',
        'del', 'ins', 'a', 'abbr', 'dfn', 'em', 'strong', 'sub', 'sup',
        'b', 'i', 'u', 's', 'tt',
        'form', 'button', 'fieldset', 'label', 'legend', 'select', 'option', 'optgroup', 'textarea',
        'table', 'thead', 'tbody', 'tfoot', 'th', 'tr', 'td', 'col', 'colgroup', 'caption',
        'address', 'blockquote', 'center', 'code','map', 'object', 'iframe',
        // single
        'base', 'link', 'meta', 'hr', 'br', 'area', 'param', 'input', 'img'
	];
	
	mlf(tags).forEach(function(t) {
		Llama.prototype[t] = $$.bind(null, t)
	})
	
	var uid = (function () {
		var x=4242, s=4213, mn=1296, mx=46656
		return function () {
			var i = (x%(mx-mn))+mn
			x+=s
			return (i).toString(36);
		}
	})()
	
	function LlamaTag(t, c) {
		this.t = t // tagname
		if (c.length > 0
			&& typeof c[0] === 'object'
			&& !(c[0] instanceof LlamaVar)
			&& !(c[0] instanceof LlamaTag)) {
			this.a = c.shift() // args
		} else {
			this.a = {}
		}
		this.c = c // children
	}
	LlamaTag.prototype.render = function () {
		var r = this.startTag()
		if (this.c.length > 0) {
			r += this.renderChildren()
			r += this.closeTag()
		}
		return r
	}
	function renderChildren () {
		return mlf(this.c).map(function(c) {
			if (typeof c === 'object') {
				if (c instanceof LlamaVar) {
					return c.val()
				} else if (c instanceof LlamaTag) {
					return c.render()
				} else {
					return JSON.stringify(c)
				}
			} else {
				return c
			}
		}).get().join('')
	}
	LlamaTag.prototype.renderChildren = renderChildren
	LlamaTag.prototype.startTag = function () {
		return '<' + this.t + this.tagAttr() + '>'
	}
	LlamaTag.prototype.renewUid = function() {
		if ('uid' in this) {
			delete this.uid
			delete this.a['id']
		}
	}
	LlamaTag.prototype.tagAttr = function () {
		var ks = Object.keys(this.a);
		if (! ks.some(function (k) {return k==='$'||k==='id'})) {
			if (!('uid' in this)) this.uid = uid()
			this.a['id'] = this.uid
			ks.unshift('id')
		}
		if (ks.length === 0) return '';
		return ' ' + mlf(ks).map(function (k) {
			var v = this.a[k];
			if (k==='$') k = 'id';
			if (k==='_') k = 'class';
			return k + '="' + (typeof v === 'function' ? v(this) : v)  + '"'
		}.bind(this)).get().join(' ')
	}
	LlamaTag.prototype.closeTag = function () {
		return '</' + this.t + '>'
	}
	
	LlamaTag.prototype.listen = function () {
		
	}
	
    return Llama()
}
