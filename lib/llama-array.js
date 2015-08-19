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

module.exports = (function() {
    'use strict'
    
    var mlf = require('mlf')
      , LlamaVar = require('./llama-var.js')
      , LlamaTag = require('./llama-tag.js')
    
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
        this.t = []
    }
    LlamaArray.prototype = Object.create(LlamaVar.prototype)
    LlamaArray.prototype.each = function() {
        var t = new LlamaArrayEachTag(this, Array.prototype.slice.call(arguments))
        this.t.push(t)
        return t
    }
    LlamaArray.prototype._v = function() {
        return new LlamaArrayVal(this)
    }
    
    function LlamaArrayVal(a,i) {
        this.a = a
        this.i = i || 0
        this.s = [] // subscribers
    }
    LlamaArrayVal.prototype = Object.create(LlamaVar.prototype)
    LlamaArrayVal.prototype.$v = function() {
        return this.a.v[this.i]
    }
    LlamaArrayVal.prototype.clone = function(i) {
        return new LlamaArrayVal(this.a, i)
    }

    function LlamaArrayEachTag(a, c) {
        this.t = 'ArrayEachTag'
        this.a = a
        this.c = c
        this.setChildrenParent()
        this.x = mlf(a.v).map(function (v, i) {
            return new LlamaArrayTag(v, i, this, this.cloneChild(c, function(o,n) {
                if (n instanceof LlamaArrayVal && this.a === n.a) {
                    if (i != 0) {
                        n = n.clone(i)
                    }
                    n.sub(this)
                }
                return n
            }.bind(this)))
        }.bind(this)).get()
    }
    LlamaArrayEachTag.prototype = Object.create(LlamaTag.prototype)
    LlamaArrayEachTag.prototype.render = function (options){
        this.setUid()
        return mlf(this.x).map(function(x) {
            return x.render(options)
        }.bind(this)).get().join('')
    }
    
    function LlamaArrayTag(v, i, p, c) {
        LlamaTag.call(this, null, c)
        this.v = v
        this.i = i
        this.setParent(p)
        this.setChildrenParent()
    }
    LlamaArrayTag.prototype = Object.create(LlamaTag.prototype)
    LlamaArrayTag.prototype.render = function(options) {
        this.setUid()
        if ('indent' in options) options.indent.setDelta(this.i*this.c.length)
        return this.renderChildren(options)
    }
    return LlamaArray
})()
