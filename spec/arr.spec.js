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

var arr = require(__dirname+'/../lib/arr.js')
describe("Array methods:", function() {
    var a = arr([1, 2, 3])
    describe("final method:", function() {
        describe("forEach:", function() {
            it("count", function() {
                var c = 0
                a.forEach(function() { c+=1 })
                expect(c).toEqual(3)
            })
            it("count with interrupt", function() {
                var c = 0
                a.forEach(function(e) { c+=1; if (e > 1) return false })
                expect(c).toEqual(2)
            })
        })
        describe("reduce:", function() {
            it("sum", function() {
                expect(a.reduce(function(a,b) {return a+b})).toEqual(6)
            })
            it("sum", function() {
                expect(a.reduce(function(a,b) {return a+b}, 4)).toEqual(10)
            })
            it("to text", function() {
                expect(a.reduce(function(p,c) {return p+c}, '')).toEqual('123')
            })
        })
        describe("reduceRight:", function() {
            it("sum", function() {
                expect(a.reduceRight(function(a,b) {return a+b})).toEqual(6)
            })
            it("sum", function() {
                expect(a.reduceRight(function(a,b) {return a+b}, 4)).toEqual(10)
            })
            it("to text", function() {
                expect(a.reduceRight(function(p,c) {return p+c}, '')).toEqual('321')
            })
        })
    })
    describe("chainable method:", function() {
        describe("map:", function() {
            it("square", function() {
                expect(a.map(function(x) {return x*x}).get()).toEqual([1,4,9])
            })
            it("to text", function() {
                expect(a.map(function(x) {var i = 0, r='';for(; i < x; i+=1) {r += 'x'}; return r}).get()).toEqual(['x','xx','xxx'])
            })
        })
        describe("filter:", function() {
            it("odd", function() {
                expect(a.filter(function(a) {return a%2===1}).get()).toEqual([1,3])
            })
            it("even", function() {
                expect(a.filter(function(a) {return a%2===0}).get()).toEqual([2])
            })
        })
    })
})