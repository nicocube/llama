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
      , LlamaTagOptions = require('./llama-option.js')

    function LlamaTag(t, c) {
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
    LlamaTag.prototype.parseOptions = function(options) {
        if (options instanceof LlamaTagOptions) return options
        else return new LlamaTagOptions(options)
    }
    LlamaTag.prototype.render = function(options) {
        options = this.parseOptions(options || {})
        var r = ''
        r += options.aroundStartTag(this.startTag(options))
        if (this.c.length > 0) {
            r += options.aroundChildrenRender(this.renderChildren(options))
            r += options.aroundStopTag(this.closeTag())
        }
        return r
    }
    function renderChildren (options) {
        return mlf(this.c).map(function(c, i) {
            if (typeof c === 'object') {
                if (c instanceof LlamaVar) {
                    return c.val()
                } else if (c instanceof LlamaTag) {
                    if ('indent' in options) options.indent.setPosition(i)
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
    LlamaTag.prototype.startTag = function(options) {
        return '<' + this.t + this.tagAttr(options) + '>'
    }
    LlamaTag.prototype.renewUid = function() {
        if ('uid' in this) {
            delete this.uid
            delete this.a['id']
        }
    }
    LlamaTag.prototype.tagAttr = function(options) {
        var ks = Object.keys(this.a)
        if (! ks.some(function(k) {return k==='$'||k==='id'})) {
            if (!('uid' in this)) this.uid = options.uid()
            this.a['id'] = this.uid
            ks.unshift('id')
        }
        if (ks.length === 0) return ''
        return ' ' + mlf(ks).map(function(k) {
            var v = this.a[k]
            if (k==='$') k = 'id'
            if (k==='_') k = 'class'
            return k + '="' + (typeof v === 'function' ? v(this) : v)  + '"'
        }.bind(this)).get().join(' ')
    }
    LlamaTag.prototype.closeTag = function() {
        return '</' + this.t + '>'
    }
    
    LlamaTag.prototype.listen = function(cb) {
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
    LlamaTag.prototype.call = function() {
        this.cb(this.uid, this.renderChildren())
    }
    
    return LlamaTag
})()
