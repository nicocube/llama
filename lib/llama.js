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
        block : function (tagName, attr, elements) { return this.open_block(tagName, attr) + this.children(elements) + this.close_block(tagName) },
        open_block: function (tagName, attr) { return '<' + tagName + (typeof attr !== 'undefined' ? this.tag_attr(attr) : '') + '>' },
        tag_attr: function(attr) {var ks = Object.keys(attr); if (ks.length === 0) return ''; return ' ' + mlf(ks).map(function (k) { var v = attr[k]; if (k==='_') k = 'class'; return k + '="' + (typeof v === 'function' ? v(this) : v)  + '"' }, ' ').get().join(' ') },
        close_block: function (tagName) { return '</' + tagName + '>' },
        children : function (elements) { 
            return mlf(elements).map(function(e) {return typeof e === 'function' ? e(this) : e }.bind(this)).get().join('')
        }

    }
    
    function parse(x) {
        return function(o) {
        console.log('parse',o)
            switch (typeof o) {
            case 'string':
                return o;
            case 'function':
                return o(x)
            }
        }
    }
    
    function build_block(tagName) {
        return function ($) {
            var attr, v = Array.prototype.slice.call(arguments)
            if (typeof v[0] === 'object') attr = v.shift()
            return formatter.block(tagName, attr, mlf(v).map(parse($)).get())
        }
    }
    
    function build_single(tagName) {
        return function () {
            var attr, v = Array.prototype.slice.call(arguments)
            if (typeof v[0] === 'object') attr = v.shift()
            return formatter.open_block(tagName, attr)
        }
    }
    
    function each() {
        var v = Array.prototype.slice.call(arguments)
        var arr = v.shift(), k = '_'
        console.log('XXXXX each', arr)
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
        return function(x) {
            return formatter.children(mlf(arr).map(function(e) { var y = {}; mlf(Object.keys(x)).forEach(function(k) {y[k] =  x[k]}); y[k] = e; return mlf(v).map(parse(y)).get()}).reduce(function (p,c) { Array.prototype.push.apply(p,c); return p }, []))
        }
    }
    
    function context() {}
    function register() {}
    
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
    var dolRx = new RegExp('(\\$[_a-zA-Z0-9]*)\\s*\\(','gm') 
    var tagRx = new RegExp('((?:each|'+blocks.join('|')+'|'+single.join('|')+')\\s*\\()','gm')
    
    function compile(descr) {
        var tags = {}
        mlf(blocks).forEach(function (e) { tags[e] =  build_block(e).bind(tags) })
        mlf(single).forEach(function (e) { tags[e] =  build_single(e).bind(tags) })
        tags.each = each.bind(tags)
        tags.context = context.bind(tags)
        tags.register = register.bind(tags)
        
        var res
        descr.toString().replace(funRx, function(_0, name, param, body) {
            body.replace(dolRx, function(_0, param) { tags.register(param) })
            body = body.replace(tagRx,'tags.$1')
            body = 'return function(context) {\n    tags.context(context);\n'+body+'}'
            console.log('body:' ,body)
            var f = new Function('tags', body)
            res = f(tags)
        })
        return res
    }
    
    return compile
}
