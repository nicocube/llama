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
	require('knit').inject(function (knit, underscore, wool, mime) {
		return knit.config(function (bind) {
			bind('_').to(underscore._)
			bind('mime').to(mime.lookup)
			bind('urlparser').to(require('url').parse)
			bind('default_field').to('url')
			bind('def_filter').to(wool.filter)
			bind('http_status').to(wool.http_status)
			bind('root_filter').to(function (filter) {return filter.root_filter}).is('builder')
			bind('filter').to(function (def_filter) {return def_filter('url')}).is('builder')
			bind('dispatch').to(wool.dispatch).is('builder')
			bind('static').to(function (http_status, mime, urlparser, fs) {return wool.static(http_status, mime, urlparser, fs);}).is('builder')
			bind('template').to(wool.template).is('builder')
		}).inject(function(http, fs, _, filter, dispatch, static, http_status, template) {
			var static_methods = ['HEAD', 'GET']
			var template_regex = options.regex ? new RegExp(options.regex) : template.regex
			
			return http.createServer(function (req,res) {
				console.log('%s %s %s',Date(), req.method, req.url)
				dispatch.chain([
					dispatch.rule({method: static_methods, url: function(url) {return options.static.some(function(x) {return url.indexOf(x)==0})}}, static.build(0,options.folder)),
					dispatch.rule({method: static_methods, url: template_regex}, template.build(options.template_folder || options.folder, options.data_folder ||  options.folder, template_regex)),
					dispatch.rule({method: filter.not(static_methods)}, function(req,res) { http_status(405)(res); }),
					dispatch.rule(true, function(req,res) { http_status(404)(res); })
				])(req,res)
			})
		})
	}).listen(options.PORT)
}
