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


var t = require( __dirname + '/../lib/llama.js')();
var
build_template = function() {
	var
	$name = t.$("Plop"),
	$arr = t.$([1,2,3]);
	return t.div({$:'main', _:'content'},
		t.h1("Hello ", $name(), "!"),
		t.ul($arr.each(
			t.li('plip:', $arr._v())
		))
	)
},
template = build_template(),
reuse = function () {
	return template.render()
},
no_reuse = function () {
	return build_template().render()
}

function bench(n, m, f) {
    console.time(n+' loop '+m)
    for (var i = 0 ; i < n ; i+=1) {
		f()
    }
    console.timeEnd(n+' loop '+m)
}

function incr_bench(l, m, f) {
	var n = 100
	for (var i = 0 ; i < l ; i+=1) {
		bench(n, m, f)
		n*=10
	}
}

var x = 3

incr_bench(x, 'no reuse', no_reuse)
incr_bench(x, 'reuse', reuse)
