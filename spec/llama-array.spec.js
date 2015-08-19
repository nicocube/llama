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

var llama = require( __dirname + '/../lib/llama.js');

describe("array manipulation", function() {

	it("set values with indices", function() {
		var t = llama()
		var
		$name = t.$("Plop"),
		$arr = t.$([1,2,3]),
		template = t.div({$:'main', _:'content'},
			t.h1("Hello ", $name(), "!"),
			t.ul($arr.each(
				t.li('plip:', $arr._v())
			))
		)
		var cbCalled = 0
		var expected = [
			{id : 'kiz', content: 'plip:42'},
			{id : 'xj3', content: 'plip: with love from Russia'}
		]
		
		
		template.listen(function(id, content, action) {
			console.log('id:',id)
			console.log('content:', content)
			
			if (cbCalled in expected) {
				var e = expected[cbCalled]
				expect(id).toEqual(e.id)
				expect(content).toEqual(e.content)
			}
			
			cbCalled +=1
		})

		var res = template.render()
		
		expect(res).toEqual('<div id="main" class="content"><h1 id="7iv">Hello Plop!</h1><ul id="arw"><li id="kiz">plip:1</li><li id="r11">plip:2</li><li id="xj3">plip:3</li></ul></div>')
		
		$arr.setValue(0, 42)
		
		res = template.render()
		
		expect(res).toEqual('<div id="main" class="content"><h1 id="7iv">Hello Plop!</h1><ul id="arw"><li id="kiz">plip:42</li><li id="r11">plip:2</li><li id="xj3">plip:3</li></ul></div>')
		
		$arr.setValue(2, " with love from Russia")
		
		res = template.render()
		
		expect(res).toEqual('<div id="main" class="content"><h1 id="7iv">Hello Plop!</h1><ul id="arw"><li id="kiz">plip:42</li><li id="r11">plip:2</li><li id="xj3">plip: with love from Russia</li></ul></div>')
		
		expect(cbCalled).toEqual(2, "Listener has to be called twice and only twice.")
	})
})
