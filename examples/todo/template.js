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

module.exports = function (t) {
    return function (name) {
        return t.html(
            t.head(t.title('Todo-List')),
            t.body(
				t.ul({_:'todo-list'},
					t.input({$: 'create', _:'edit', value:"Create a TodoMVC template"}),
					t.li({_:'completed'},
						t.div({_:'view'},
							t.input({_:'toggle', type:'checkbox', checked:true}),
							t.label('Taste JavaScript'),
							t.button({_:'destroy'})
						)
					),
					t.li(
						t.div({_:'view'},
							t.input({_:'toggle', type:'checkbox'}),
							t.label('Buy a unicorn'),
							t.button({_:'destroy'})
						)
					)
				),
                t.script({src: './client.js'},'')               
            )
        )
    }
}
