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

var t = require('llama')()
  , main = require('./template.js')(t)
  , name = t.$(data)
  , page = main(name)
  , data = document.getElementById('data')

//console.log(document.getElementsByTagName('html').item(0).id)

page.render()
page.listen(function(id, html) {
	console.log('id', id, html)
	document.getElementById(id).innerHTML = html
})

function onevent() {
	console.log('event', data.value)
	name(data.value)
	history.pushState(null, null, '/'+data.value)
}

data.addEventListener('keyup', onevent)
data.addEventListener('change', onevent)
