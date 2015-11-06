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

    function LlamaObject(v, $) {
        if (!(this instanceof LlamaObject)) {
            var x = new LlamaObject(v, $)

            mlf(Object.keys(v)).forEach(function(k) {
                x[k] = $(v[k])
            })

            return x
        }
        this.v = v // value
        this.$ = $
        this.s = [] // subscribers
    }
    LlamaObject.prototype = Object.create(LlamaVar.prototype)
    LlamaObject.prototype.val = function() {
        if (arguments.length === 0) return this.$v()
        var v = arguments[0], t = typeof v
        if (t === 'object') {
            var ks = Object.keys(v)

            mlf(Object.keys(this.v))
            .filter(function(k){ return ks.indexOf(k) === -1 })
            .forEach(function(k) {
                if (this[k].isVar) {
                    this[k].val(undefined)
                    v[k] = this[k].v
                } else if (this[k].isVarFun) {
                    v[k] = this[k](undefined)
                }
            }.bind(this))

            mlf(ks).forEach(function(k) {
                if(k in this) {
                    this[k].val(v[k])
                } else if (this[k].isVarFun) {
                    this[k] = this.$(v[k])
                }
            })
        }
        if (t === 'undefined') {
            v = {}
            mlf(Object.keys(this.v))
            .forEach(function(k) {
                if (this[k].isVar) {
                    v[k] = this[k].val(undefined)
                } else if (this[k].isVarFun) {
                    v[k] = this[k](undefined)
                }
            }.bind(this))
        }

        this.v = v

        this.pub()
    }

    return LlamaObject
})()
