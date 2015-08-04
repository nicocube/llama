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
    
    var seed_uid = require('./seed_uid.js')
    
    function LlamaTagIndentOption(indent) {
        this.indent = indent
        this.depth = 0
        this.delta = 0
        this.ctx = [{p: 0, c:false}]
    }
    LlamaTagIndentOption.prototype.tab = function(d) {
        var i = 0, l = d*this.indent, t =''
        for (; i < l ; i+=1) t+=' '
        return t
    }
    LlamaTagIndentOption.prototype.aroundStartTag = function(r) {
        var pos = this.getPosition()
        r = (pos === 0 ? '\n': '') + this.tab(this.depth) + r
        this.depth+=1
        this.pushCtx()
        return r
    }
    LlamaTagIndentOption.prototype.aroundChildrenRender = function(r) {
        return r
    }
    LlamaTagIndentOption.prototype.aroundStopTag = function(r) {
        this.depth-=1
        this.ctx.shift()
        if (this.hasTagChildren()) {
            r = this.tab(this.depth)+r
        }
        r+=(this.ctx.length > 1 ? '\n' : '')
        return r
    }
    LlamaTagIndentOption.prototype.setDelta = function(i) {
        this.delta = i
    }
    LlamaTagIndentOption.prototype.setPosition = function(i) {
        this.ctx[0].p = i + this.delta
    }
    LlamaTagIndentOption.prototype.getPosition = function() {
        if (this.ctx.length === 1) return -1
        return this.ctx[0].p
    }
    LlamaTagIndentOption.prototype.pushCtx = function() {
        if (this.ctx.length > 1) this.ctx[1].c = true
        this.ctx.unshift({p: 0, c:false})
    }
    LlamaTagIndentOption.prototype.hasTagChildren = function() {
        return this.ctx[0].c
    }
    
    function LlamaTagOptions(options) {
        if ('indent' in options && typeof options.indent === 'number') {
            this.indent = new LlamaTagIndentOption(options.indent)
        }
        if ('startIds' in options && typeof options.startIds === 'number') {
            this.uid = seed_uid(options.startIds)
        }
        if (!('uid' in this)) {
            this.uid = seed_uid(0)
        }
    }
    LlamaTagOptions.prototype.aroundStartTag = function(r) {
        if ('indent' in this) return this.indent.aroundStartTag(r)
        else return r
    }
    LlamaTagOptions.prototype.aroundChildrenRender = function(r) {
        if ('indent' in this) return this.indent.aroundChildrenRender(r)
        else return r
    }
    LlamaTagOptions.prototype.aroundStopTag = function(r) {
        if ('indent' in this) return this.indent.aroundStopTag(r)
        else return r
    }
    
    return LlamaTagOptions
})()
