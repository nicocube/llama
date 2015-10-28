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
      , LlamaTagOptions = require('./llama-option.js')
      , seed_uid = require('./seed_uid.js')

    function LlamaTag(t, c) {
        this.t = t // tagname
        if (c.length > 0
            && typeof c[0] === 'object'
            && !(c[0].isVar)
            && !(c[0].isTag)) {
            this.a = c.shift() // args
        } else {
            this.a = {}
        }
        this.c = c // children
        this.setChildrenParent()
    }
    LlamaTag.prototype.isTag = true
    LlamaTag.prototype.setChildrenParent = function() {
        mlf(this.c).forEach(function(c) {
            if (c.isTag) {
                c.setParent(this)
            }
        }.bind(this))
    }
    LlamaTag.prototype.setParent = function(p) {
        this.p = p
    }
    LlamaTag.prototype.isRoot = function() {
        return !('p' in this)
    }
    LlamaTag.prototype.clone = function(visitor) {
        var c = this.cloneChild(this.c, visitor)
        c.unshift(this.a)
        return new LlamaTag(this.t, c)
    }
    LlamaTag.prototype.cloneChild = function(c, visitor) {
        return mlf(c).map(function(o) {
            var n = (o.isTag) ? o.clone(visitor) : o
            if (typeof visitor === 'function') n = visitor(o,n)
            return n
        }.bind(this)).get()
    }
    LlamaTag.prototype.parseOptions = function(options) {
        if (options instanceof LlamaTagOptions) return options
        else return new LlamaTagOptions(options)
    }
    LlamaTag.prototype.setUid = function() {
        if (this.isRoot()) {
            this.uid_provider = seed_uid(0)
        } else {
            this.uid_provider = this.p.uid_provider
        }
        this.uid = this.uid_provider()
    }
    LlamaTag.prototype.render = function(options) {
        this.setUid()
        options = this.parseOptions(options || {})
        var r = ''
        r += options.aroundStartTag(this.startTag(options))
        if (this.c.length > 0) {
            r += options.aroundChildrenRender(this.renderChildren(options))
            r += options.aroundStopTag(this.closeTag())
        }
        return r
    }
    LlamaTag.prototype.renderChildren = function(options) {
        return mlf(this.c).map(function(c, i) {
            if (typeof c === 'object') {
                if (c.isTag) {
                    if ('indent' in options) options.indent.setPosition(i)
                    return c.render(options)
                } else if (c.isVar) {
                    return c.val()
                } else {
                    return JSON.stringify(c)
                }
            } else {
                return c
            }
        }.bind(this)).get().join('')
    }
    LlamaTag.prototype.startTag = function(options) {
        return '<' + this.t + this.tagAttr(options) + '>'
    }
    LlamaTag.prototype.tagAttr = function() {
        var ks = Object.keys(this.a), id = null
        if ('id' in this.a) {
            id = this.a.id
        } else if ('$' in this.a) {
            id = this.a.$
        } else {
            id = this.uid
            ks.unshift('id')
        }
        if (ks.length === 0) return ''
        return ' ' + mlf(ks).map(function(k) {
            var v = this.a[k]
            if (k === '$') k = 'id'
            if (k === 'id') v = id
            if (k==='_') k = 'class'
            return k + '="' + (typeof v === 'function' ? v(this) : (typeof v === 'object' && v.isVar) ? v.val(): v)  + '"'
        }.bind(this)).get().join(' ')
    }
    LlamaTag.prototype.closeTag = function() {
        return '</' + this.t + '>'
    }
    LlamaTag.prototype.listen = function(cb) {
        this.setUid()
        this.cb = cb // listener
        mlf(this.c).forEach(function(c) {
            if (typeof c === 'object') {
                if (c.isTag) {
                    c.listen(cb)
                }
                if (c.isVar) {
                    c.sub(this)
                }
            }
        }.bind(this))
        /*
        Object.keys(this.a)
        .map(function(k){ return this.a[k] }.bind(this))
        .forEach(function(o) { if (o.isVar) o.sub(this) }.bind(this))
         */
    }
    LlamaTag.prototype.call = function() {
        this.cb(this.uid, this.renderChildren(this.parseOptions({})))
    }

    return LlamaTag
})()
