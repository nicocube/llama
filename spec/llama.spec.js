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


var llama = require( __dirname + '/../lib/llama.js')(require('mlf'), require('node.extend'))

describe("template testing", function() {
    "use strict"

    xdescribe("no options", function() {
        it("Hello world!", function() {
            var template = llama(function() {
                return h1("Hello World!");
            })

            var res = template()
            expect(res).toEqual('<h1>Hello World!</h1>')

        })
        it("simple each", function() {
            var template = llama(function() {
                return ul(each([1,2,3], li('plip:', $()) ))
            })

            var res = template()
            expect(res).toEqual('<ul><li>plip:1</li><li>plip:2</li><li>plip:3</li></ul>')
        })
        it("embeded each", function() {
            var template = llama(function() {
                return div(
                    each({i: [1,2,3]},
                        div('i:', $i()),
                        each({j: [1,2,3]},
                            div('j:', $i(), '*', $j())
                        )
                    )
                )
            })

            var res = template()
            expect(res).toEqual('<div><div>i:1</div><div>j:1*1</div><div>j:1*2</div><div>j:1*3</div><div>i:2</div><div>j:2*1</div><div>j:2*2</div><div>j:2*3</div><div>i:3</div><div>j:3*1</div><div>j:3*2</div><div>j:3*3</div></div>')

        })
        it("complex template", function() {
            var template = llama(function() {
                return div({id:'plop', _:'paf pouf'}, h1("Hello ", $name(), "!"),
                    ul(each([1,2,3],
                        li('plip:', $())
                    )),
                    div(
                        each({i: [1,2,3]},
                            div('i:', $i()),
                            each({j: [1,2,3]},
                                div('j:', $i(), '*', $j())
                            )
                        )
                    )
                )
            })

            var res = template({name: 'Plop'})
            expect(res).toEqual('<div id="plop" class="paf pouf"><h1>Hello Plop!</h1><ul><li>plip:1</li><li>plip:2</li><li>plip:3</li></ul><div><div>i:1</div><div>j:1*1</div><div>j:1*2</div><div>j:1*3</div><div>i:2</div><div>j:2*1</div><div>j:2*2</div><div>j:2*3</div><div>i:3</div><div>j:3*1</div><div>j:3*2</div><div>j:3*3</div></div></div>')

        })
    })

    describe("indent option", function() {
        it("Hello world!", function() {
            var template = llama(function() {
                return h1("Hello World!");
            })

            var res = template({},{indent:4})
            expect(res).toEqual('<h1>Hello World!</h1>')

        })
        it("simple each", function() {
            var template = llama(function() {
                return ul(each([1,2,3], li('plip:', $()) ))
            })

            var res = template({},{indent:4})
            expect(res).toEqual('<ul>\n    <li>plip:1</li>\n    <li>plip:2</li>\n    <li>plip:3</li>\n</ul>')
        })
        xit("embeded each", function() {
            var template = llama(function() {
                return div(
                    each({i: [1,2,3]},
                        div('i:', $i()),
                        each({j: [1,2,3]},
                            div('j:', $i(), '*', $j())
                        )
                    )
                )
            })

            var res = template({},{indent:4})
            expect(res).toEqual('<div>\n    <div>i:1</div>\n    <div>j:1*1</div>\n    <div>j:1*2</div>\n    <div>j:1*3</div>\n    <div>i:2</div>\n    <div>j:2*1</div>\n    <div>j:2*2</div>\n    <div>j:2*3</div>\n    <div>i:3</div>\n    <div>j:3*1</div>\n    <div>j:3*2</div>\n    <div>j:3*3</div>\n</div>')

        })
        xit("complex template", function() {
            var template = llama(function() {
                return div({id:'plop', _:'paf pouf'}, h1("Hello ", $name(), "!"),
                    ul(each([1,2,3],
                        li('plip:', $())
                    )),
                    div(
                        each({i: [1,2,3]},
                            div('i:', $i()),
                            each({j: [1,2,3]},
                                div('j:', $i(), '*', $j())
                            )
                        )
                    )
                )
            })

            var res = template({name: 'Plop'},{indent:4})
            expect(res).toEqual('<div id="plop" class="paf pouf">\n    <h1>Hello Plop!</h1>\n    <ul>\n        <li>plip:1</li>\n        <li>plip:2</li>\n        <li>plip:3</li>\n    </ul>\n    <div>\n        <div>i:1</div>\n        <div>j:1*1</div>\n        <div>j:1*2</div>\n        <div>j:1*3</div>\n        <div>i:2</div>\n        <div>j:2*1</div>\n        <div>j:2*2</div>\n        <div>j:2*3</div>\n        <div>i:3</div>\n        <div>j:3*1</div>\n        <div>j:3*2</div>\n        <div>j:3*3</div>\n    </div>\n</div>')

        })
    })
})
