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

module.exports = function() {
    'use strict'
    var mlf = require('mlf')
      , LlamaVar = require('./llama-var.js')
      , LlamaTag = require('./llama-tag.js')
      , LlamaArray = require('./llama-array.js')
      
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
    Llama.prototype.$$ = $$
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
    ]
    
    /**
     * Generate automatically all the tags methods
     */
    mlf(tags).forEach(function(t) {
        Llama.prototype[t] = $$.bind(null, t)
    })
    
    var exp = Llama()
    exp.Llama = Llama
    exp.LlamaVar = LlamaVar
    exp.LlamaTag = LlamaTag
    exp.LlamaArray = LlamaArray
    return exp
}
