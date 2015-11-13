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

describe("object manipulation", function() {

	it("render object", function() {
		var t = llama()
		var
		$obj = t.$({name: 'Plop', style: {content: 'content'}}),
		template = t.div({$:'main', _:$obj.style.content()},
			t.h1("Hello ", $obj.name(), "!")
		)
		var res = template.render()
		expect(res).toEqual('<div id="main" class="content"><h1 id="7iv">Hello Plop!</h1></div>')
	})
	
	it("update object", function() {
		var t = llama()
		var
		$obj = t.$({name: 'Plop', style: {content: 'content'}}),
		template = t.div({$:'main', _:$obj.style.content()},
			t.h1("Hello ", $obj.name(), "!")
		)
		
		var cbCalled = 0
		var expected = [
			{id : '7iv', content: 'Hello Foo!'},
			{id : '7iv', content: 'Hello !'},
			{id : 'main', content: [{class:''}], action: 'arg'},
			{id : 'main', content: [{class:'paf'}], action: 'arg'}
		]
		template.listen(function(id, content, action) {
			if (cbCalled in expected) {
				var e = expected[cbCalled]
				expect(id).toEqual(e.id)
				expect(content).toEqual(e.content)
				expect(action).toEqual(e.action)
			}
			cbCalled +=1
		})

		var res = template.render()
		expect(res).toEqual('<div id="main" class="content"><h1 id="7iv">Hello Plop!</h1></div>')
		
		$obj.name("Foo")
		
		res = template.render()
		expect(res).toEqual('<div id="main" class="content"><h1 id="7iv">Hello Foo!</h1></div>')
		
		$obj.val({})
		
		res = template.render()
		expect(res).toEqual('<div id="main" class=""><h1 id="7iv">Hello !</h1></div>')
		
		$obj.style.content("paf")
		
		res = template.render()
		expect(res).toEqual('<div id="main" class="paf"><h1 id="7iv">Hello !</h1></div>')
        
		expect(cbCalled).toEqual(expected.length, "Listener has to be called "+expected.length+" times.")
	})

	it("render array of object", function() {
		var t = llama()
		var
		$arr = t.$([
            {name: 'Plop', style: {content: 'foo'}},
            {name: 'Plip', style: {content: 'bar'}},
        ]),
		template = t.div({$:'main'}, $arr.each(t.div({_:$arr._v().style.content()},t.h1("Hello ", $arr._v().name(), "!"))))
		var res = template.render()
		expect(res).toEqual('<div id="main"><div class="foo"><h1 id="7iv">Hello Plop!</h1></div><div class="bar"><h1 id="7iv">Hello Plip!</h1></div></div>')
	})
})
