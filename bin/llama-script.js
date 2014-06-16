#!/usr/bin/env node
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
 
require('knit').inject(function (knit) {
	knit.config(function (bind) {
		bind('llama').to(require(__dirname + '/../lib/llama.js'))
	}).inject(function (fs, llama, str_to_obj) {
		
		var default_options_location = __dirname + '/../config.json',
			local_value_location = './config.json'
			
		var options = {
			folder: '.',
			static : ["/favicon.ico","/img", "/css"],
			PORT: 8000
		}

		var usage = "Usage: llama [options]\n" +
					"Options:\n\n" +
					"  -c, --config FILE     the path to a JSON file with options (convention is to search for config.json in folder)\n" +
					"  -f, --folder Folder   the path to the folder to run llama in\n" +
					"  -p, --port PORT       the PORT number to run this llama with\n" +
					"  -h, --help        display this help and exit\n" +
					"  -v, --version     output version information and exit";


		function loadConfig(file, noFault, noMessage) {
			try {
				var content = fs.readFileSync(file, 'utf8')
				var update = str_to_obj(content)
				for (u in update) {
					if (typeof u === 'string') {
						options[u] = update[u]
					}
				}
			} catch(e) {
				if (noFault) {
					if (!noMessage) console.warn(e)
				} else
					throw e
			}
		}

		loadConfig(default_options_location,true,true)


		var useLocalConfig = true,
			hasConfig=false,
			hasFolder = false,
			hasPort = false

		process.argv.slice(2).forEach(function (arg) {
			switch (arg) {
				case '-h':
				case '--help':
					console.log(usage)
					process.exit(0)
					return;
				case '-v':
				case '--version':
					var content = fs.readFileSync(__dirname + '/../package.json', 'utf8')
					var pkg = JSON.parse(content)
					console.log(pkg.version)
					process.exit(0)
					return;
				case '-c':
				case '--config':
					hasConfig=true
					return;
				case '-p':
				case '--port':
					hasPort=true
					return;
				case '-f':
				case '--folder':
					hasFolder=true
					return;
				default:
					if (hasConfig) {
						loadConfig(arg)
						hasConfig=false
						useLocalConfig=false
					}
					if (hasFolder) {
						options.folder = arg
						hasFolder=false
					}
					if (hasPort) {
						options.PORT = arg
						hasPort = false
					}
					return;
			}

		})

		if (useLocalConfig)
			loadConfig(local_value_location,true,true)

		llama(options)

	})
})
