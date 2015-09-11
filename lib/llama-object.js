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
            var x = new LlamaObject(v)

            mlf(Object.keys(v)).forEach(function(k) {
                x[k] = $(v[k])
            })

            return x
        }
        this.v = v
    }
    LlamaObject.prototype = Object.create(LlamaVar.prototype)

    return LlamaObject
})()
