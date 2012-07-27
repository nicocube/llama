/*
 * Copyright 2012 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */
 
module.exports = function (options) {
	require('knit').inject(function(http, fs, wool, filter, dispatch, static, http_status, template, knit) {
		//console.log(knit.showConfig())
		//console.log(__dirname)
		var static_methods = ['HEAD', 'GET'],
			template_regex = options.regex ? new RegExp(options.regex) : template.regex
			dispatcher = dispatch.chain([
				dispatch.rule({method: static_methods, url: function(url) {return options.static.some(function(x) {return url.indexOf(x)==0})}}, static.build(0,options.folder)),
				dispatch.rule({method: static_methods, url: template_regex}, template.build(options.template_folder || options.folder, options.data_folder ||  options.folder, template_regex, options.str_to_obj_inject)),
				dispatch.rule({method: filter.not(static_methods)}, function(req,res) { http_status(405)(res); }),
				dispatch.rule(true, function(req,res) { http_status(404)(res); })
			])

		return http.createServer(function (req,res) {
			console.log('%s %s %s',Date(), req.method, req.url)
			dispatcher(req,res)
		})
	}).listen(options.PORT)
}
