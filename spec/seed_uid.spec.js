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

var seed_uid = require( __dirname + '/../lib/seed_uid.js');

describe("seed_uid", function() {
	it("startWith 0", function() {
		var uid = seed_uid(0)
		
		expect(uid()).toEqual('49u')
		expect(uid()).toEqual('7iv')
		expect(uid()).toEqual('arw')
	})
	it("startWith 42", function() {
		var uid = seed_uid(42)
		
		expect(uid()).toEqual('4b0')
		expect(uid()).toEqual('7k1')
		expect(uid()).toEqual('at2')
	})
})
