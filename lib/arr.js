/*
 * Copyright 2014 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

module.exports = (function () {
    'use strict'
    function arr(_) { if (! (this instanceof arr)) return new arr(_); this._ = _; this.fs = [] }
    
    arr.prototype.get = function() {
        var _ = this._, fs = this.fs, i = 0, l = _.length, m = fs.length, r = []
        elem:
        for (; i < l ; i+=1) {
            var $ = _[i], j = 0;
            for (; j < m ; j+=1) {
                var f = fs[j]
                switch(f._arr_type){
                    case 'map':
                        $ = f($,i)
                    break
                    case 'filter':
                        if(!f($,i)) continue elem
                    break
                }
            }
            r.push($)
        }
        return r
    }
    function buildChainable(T) { return function(f, t) { f = arguments.length > 1 ? f.bind(t): f; f._arr_type = T; this.fs.push(f); return this } }

    arr.prototype.map = buildChainable('map')
    arr.prototype.filter = buildChainable('filter')
    
    arr.prototype.forEach = function(f, t) { var _ = this._, i = 0, l = _.length, g = f.bind(t); for (; i < l ; i+=1) { var v = g(_[i], i, _); if (typeof v ==='boolean' && !v) break; } }
    arr.prototype.reduce = function(f, p) { var _ = this._, i = arguments.length > 1 ? 0 : 1, l = _.length; p = arguments.length > 1 ? p : _[0]; for (; i < l ; i+=1) { p = f(p ,_[i] ,i , _) }; return p }
    arr.prototype.reduceRight = function(f, p) { var _ = this._, i = arguments.length > 1 ? _.length - 1 : _.length - 2; p = arguments.length > 1 ? p : _[_.length-1]; for (; i >= 0 ; i-=1) { p = f(p ,_[i] ,i , _) }; return p }
    arr.prototype.join = function(s) { s = s||','; return this.reduce(function(p,c,i) { return p += (i === 0 ? s: '')+c },'') }
    arr.prototype.every = function(f,t) { var g = f.bind(t), r = true; this.forEach(function(e) { if (!g(e)) { r = false; return false} }); return r } 
    arr.prototype.some = function(f,t) { var g = f.bind(t), r = false; this.forEach(function(e) { if (g(e)) { r = true; return false} }); return r }
    
    
    
    return arr
})()
