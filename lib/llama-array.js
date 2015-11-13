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
            r.setValue = LlamaArray.prototype.setValue.bind(x)
            r.push = LlamaArray.prototype.push.bind(x)
            r.unshift = LlamaArray.prototype.unshift.bind(x)
            r.splice = LlamaArray.prototype.splice.bind(x)
            return r
        }
        this.v = mlf(v).map(function(v, i) { return new LlamaArrayVal(this, v, i)}.bind(this)).get()
        this.t = []
    }
    LlamaArray.prototype = Object.create(LlamaVar.prototype)
    LlamaArray.prototype.each = function() {
        var t = new LlamaArrayEachTag(this, Array.prototype.slice.call(arguments))
        this.t.push(t)
        return t
    }
    LlamaArray.prototype._v = function() {
        return new LlamaArrayValIterator(this)
    }
    LlamaArray.prototype._i = function() {
        return new LlamaArrayIdxIterator(this)
    }
    LlamaArray.prototype.sub = function(i, x) {
        this.s[i].push(x)
    }
    LlamaArray.prototype.pub = function(i) {
        if (arguments.length === 1) {
            mlf(this.s[i]).forEach(function (x) { x.pub() })
        } else {
            mlf(this.t).forEach(function (x) { x.pub() })
        }
    }
    LlamaArray.prototype.setValue = function(i, v) {
        this.v[i] = v
        this.pub(i)
    }
    LlamaArray.prototype.push = function(v) {
        this.v.push(new LlamaArrayVal(this, v, this.v.length))
        this.pub()
    }
    LlamaArray.prototype.unshift = function(v) {
        this.v.unshift(new LlamaArrayVal(this, v, 0))
        mlf(this.v).forEach(function(v) { v.inc(1) })
        this.pub()
    }
    LlamaArray.prototype.splice = function() {
        Array.prototype.splice.apply(this.v, arguments)
        var args = Array.prototype.slice.call(arguments)
        if (args.length > 2) {
            for (var i=2, l = args.length ; i < l; i+=1) {
                args[i] = []
            }
        }
        Array.prototype.splice.apply(this.s, args)
        this.pub()
    }

    /**
    *
    */
    function LlamaArrayVal(a, v, i) {
        this.a = a
        this.v = v
        this.i = i
        this.s = [] // subscribers
    }
    LlamaArrayVal.prototype = Object.create(LlamaVar.prototype)
    LlamaArrayVal.prototype.$v = function() {
        return this.v
    }
    LlamaArrayVal.prototype.$i = function() {
        return this.i
    }
    LlamaArrayVal.prototype.inc = function(i) {
        return this.i+=i
    }
    LlamaArrayVal.prototype.clone = function(i) {
        return new LlamaArrayVal(this.a, this.v, i)
    }

    /**
    *
    */
    function LlamaArrayEachTag(a, c) {
        this.t = 'ArrayEachTag'
        this.a = a
        this.c = []
        this.o_c = c
        this.setChildrenParent()
        this.buildChild()
        this.s = [] // subscribers
    }
    LlamaArrayEachTag.prototype = Object.create(LlamaTag.prototype)
    LlamaArrayEachTag.prototype.isVar = true
    LlamaArrayEachTag.prototype.buildChild = function() {
        this.x = mlf(this.a.v).map(function (v, i) {
            return new LlamaArrayTag(v, i, this, this.cloneChild(this.o_c, function(o, n) {
                if (n instanceof LlamaArrayIterator && this.a === n.a) {
                    n = v
                }
                return n
            }.bind(this)))
        }.bind(this)).get()
    }
    LlamaArrayEachTag.prototype.sub = function(t) {
        this.s.push(t)
    }
    LlamaArrayEachTag.prototype.pub = function() {
        this.buildChild()
        this.s.forEach(function(t) { t.call() })
    }
    LlamaArrayEachTag.prototype.render = function (options){
        this.setUid()
        return mlf(this.x).map(function(x) {
            return x.render(options)
        }.bind(this)).get().join('')
    }
    LlamaArrayEachTag.prototype.listen = function(cb) {
        this.setUid()
        this.cb = cb
        mlf(this.x).forEach(function(c) {
            c.listen(cb)
        }.bind(this))
    }

    /**
    *
    */
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

    /**
    *
    */
    function LlamaArrayIterator(a){
        this.a = a
    }
    LlamaArrayIterator.prototype = Object.create(LlamaVar.prototype)
    /**
    *
    */
    function LlamaArrayIdxIterator(a){
        this.a = a
    }
    LlamaArrayIdxIterator.prototype = Object.create(LlamaArrayIterator.prototype)
    /**
    *
    */
    function LlamaArrayValIterator(a){
        this.a = a
    }
    LlamaArrayValIterator.prototype = Object.create(LlamaArrayIterator.prototype)

    return LlamaArray
})()
