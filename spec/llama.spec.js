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

var t = require( __dirname + '/../lib/llama.js')(require('mlf'))

describe("template testing", function() {
    "use strict"
    
    it("events", function() {
		var
		$name = t.$("Plop"),
		$arr = t.$([1,2,3]),
		template = t.div({$:'main', _:'content'},
			t.h1("Hello ", $name(), "!"),
			t.ul($arr.each(
				t.li('plip:', $arr._v())
			))
		)

		var res = template.render()
		
		expect(res).toEqual('<div id="main" class="content"><h1 id="49u">Hello Plop!</h1><ul id="7iv"><li id="arw">plip:1</li><li id="e0x">plip:2</li><li id="h9y">plip:3</li></ul></div>')

		var cbCalled = false
		template.listen(function(id, content) {
			cbCalled = true
			console.log('id:',id)
			console.log('content:', content)
			expect(id).toEqual('49u')
			expect(content).toEqual('Hello Plouic!')
		})

		$name('plouic')
		//expect(cbCalled).toEqual(true)
	})
    
    xit("events with indentation", function() {
		var
		$name = t.$("Plop"),
		$arr = t.$([1,2,3]),
		template = t.div({$:'main', _:'content'},
			t.h1("Hello ", $name(), "!"),
			t.ul($arr.each(
				t.li('plip:', t._())
			))
		)

		var res = template.render({indent: 2})
		
		expect(res).toEqual('<div id="main" class="content">\n  <h1 id="main-h1-a">Hello Plop!</h1>\n  <ul id="main-ul-a">\n    <li id="main-ul-a-li-a">plip:1</li>\n    <li id="main-ul-a-li-b">plip:2</li>\n    <li id="main-ul-a-li-c">plip:3</li>\n  </ul>\n</div>')

		template.listen(function(id, content) {
			console.log('id:',id)
			console.log('content:', content)
		})

		$name('plouic')
		// console.log -> id: main-h1-a
		// console.log -> content: Hello Plouic!
	})
})
