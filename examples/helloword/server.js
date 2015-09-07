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

var express = require('express')
  , app = express()
  , router = express.Router()
  , morgan = require('morgan')
  , browserify = require('browserify-middleware')
  , favicon = require('serve-favicon')
  , t = require('llama')()
  , main = require('./template.js')(t)
  , options = {startIds:0, indent: 2}

app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(morgan('dev'))
app.use(router)

router.get('/client.js', browserify('./client.js'))

router.get('/', function (req, res) {
    var name = t.$('World')
    res.send(main(name).render(options))
})

router.get('/:name', function (req, res) {
    var name = t.$(req.params.name)
    res.send(main(name).render(options))
})

app.listen(3000)
process.stdout.write('Server is running.\nOpen http://localhost:3000/\n')
