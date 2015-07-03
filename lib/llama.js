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
    
    // Import mlf if not injected throug param
    mlf = mlf || require('mlf')
    
    /**
     * The Utility entry point
     */
    function Llama() {
		if (!(this instanceof Llama)) return new Llama()
	}
    /**
     * Instantiate LlamaVar with initial value
     */
    Llama.prototype.$ = function(v) {
		if (typeof v === 'object') {
			if (v instanceof Array) {
				return LlamaArray(v)
			}
		}
		return LlamaVar(v)
	}
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
	
	/**
	 * Generate automatically all the tags methods
	 */
	mlf(tags).forEach(function(t) {
		Llama.prototype[t] = $$.bind(null, t)
	})
	
	/**
	 * 
	 * 
	 */
    function LlamaVar(v) {
		if (!(this instanceof LlamaVar)) {
			var x = new LlamaVar(v)
			var r = LlamaVar.prototype.fun.bind(x)
			return r
		}
		this.v = v // value
		this.s = [] // subscribers
	}
	LlamaVar.prototype.val = function() {
		if (arguments.length === 0) return this.v
		this.v = arguments[0]
		if ('s' in this) this.s.forEach(function(t) { t.call() })
	}
	LlamaVar.prototype.fun = function() {
		if (arguments.length === 0) return this;
		this.val(arguments[0])
	}
	LlamaVar.prototype.sub = function(t) {
		this.s.push(t)
	}
	
	function LlamaArray(v) {
		if (!(this instanceof LlamaArray)) {
			var x = new LlamaArray(v)
			var r = LlamaVar.prototype.fun.bind(x)
			r.each = LlamaArray.prototype.each.bind(x)
			r._v = LlamaArray.prototype._v.bind(x)
			return r
		}
		this.v = v // value
		this.s = [] // subscribers
	}
	LlamaArray.prototype = Object.create(LlamaVar.prototype)
	LlamaArray.prototype.each = function() {
		return this.t = new LlamaArrayTag(this, Array.prototype.slice.call(arguments))
	}
	LlamaArray.prototype._v = function () {
		var r = new LlamaArrayVal(this)
		this.curr = r
		return r
	}
	
	function LlamaArrayVal() {}
	LlamaArrayVal.prototype = Object.create(LlamaVar.prototype)

	function LlamaArrayTag(a, c) {
		this.a = a
		this.c = c
	}
	LlamaArrayTag.prototype = Object.create(LlamaTag.prototype)
	LlamaArrayTag.prototype.renewChildrenUid = function() {
		mlf(this.c).forEach(function(c) {
			if (c instanceof LlamaTag) c.renewUid()
		})
	}
	LlamaArrayTag.prototype.render = function(options) {
		var curr
		if ('curr' in this.a && this.a.curr instanceof LlamaArrayVal) {
			curr = this.a.curr
		} else {
			curr = {val: function(){}}
		}
		return mlf(this.a.v).map(function(v) {
			curr.val(v)
			this.renewChildrenUid()
			return this.renderChildren(options)
		}.bind(this)).get().join('')
	} 
	
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
	LlamaTag.prototype.parseOptions = function (options) {
		if ('indent' in options) {
			if (!('depth' in options)) options.depth = 0
			if (!('beforeRender' in options)) options.beforeRender = function() {
				this.depth+=1
			}
			if (!('aroundRender' in options)) options.aroundRender = function(r) {
				this.depth-=1
				var i = 0, l = this.depth*options.indent, t=('pos' in this && this.pos === 0? '\n': '')
				for (; i < l ; i+=1) t+=' '
				return t+r+'\n'
			}
			if (!('setPosition' in options)) options.setPosition = function(i) {
				this.pos = i
			}
		}
	}
	LlamaTag.prototype.render = function (options) {
		if (typeof options !== 'undefined') this.parseOptions(options)
		else options = {}
		var r = ''
		if ('beforeRender' in options) options.beforeRender()
		r += this.startTag()
		if (this.c.length > 0) {
			r += this.renderChildren(options)
			r += this.closeTag()
		}
		if ('aroundRender' in options) r = options.aroundRender(r)
		return r
	}
	function renderChildren (options) {
		return mlf(this.c).map(function(c, i) {
			console.log(i, c instanceof LlamaTag ? c.t : c instanceof LlamaVar ? c.v : c)
			if (typeof c === 'object') {
				if (c instanceof LlamaVar) {
					return c.val()
				} else if (c instanceof LlamaTag) {
					if ('setPosition' in options) options.setPosition(i)
					return c.render(options)
				} else {
					return JSON.stringify(c)
				}
			} else {
				return c
			}
		}.bind(this)).get().join('')
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
	
	LlamaTag.prototype.listen = function (cb) {
		this.cb = cb // listener
		mlf(this.c).forEach(function(c) {
			if (typeof c === 'object') {
				if (c instanceof LlamaVar) {
					c.sub(this)
				} else if (c instanceof LlamaTag) {
					c.listen(cb)
				}
			}
		}.bind(this))
	}
	LlamaTag.prototype.call = function () {
		this.cb(this.uid, this.renderChildren())
	}
	
    return Llama()
}
