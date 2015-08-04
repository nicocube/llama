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
    }
    LlamaArray.prototype = Object.create(LlamaVar.prototype)
    LlamaArray.prototype.each = function() {
        return this.t = new LlamaArrayTag(this, Array.prototype.slice.call(arguments))
    }
    LlamaArray.prototype._v = function() {
        var r = new LlamaArrayVal(this)
        this.curr = r
        return r
    }
    
    function LlamaArrayVal() {
        this.s = [] // subscribers
    }
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
        return mlf(this.a.v).map(function(v,i) {
            curr.val(v)
            this.renewChildrenUid()
            if ('indent' in options) options.indent.setDelta(i*this.c.length)
            return this.renderChildren(options)
        }.bind(this)).get().join('')
    }
    
    return LlamaArray
})()
