/*
 * Copyright 2022 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

'use strict'

import test from 'tape-async'

import Router, { Path, Param, Parsed } from '../router.js'

test('Path.build', async (t) => {
  t.deepEqual(Path.build('/'), new Path('/', []))
  t.deepEqual(Path.build('/plop/:id'), new Path('/plop/:id', ['plop', new Param('id')]))
  t.deepEqual(Path.build('/:foo/:bar'), new Path('/:foo/:bar', [new Param('foo'), new Param('bar')]))
  t.deepEqual(Path.build('/test/:id/re/:mid'), new Path('/test/:id/re/:mid', ['test', new Param('id'), 're', new Param('mid')]))
  t.deepEqual(Path.build('/xxx/:aid/:bid'), new Path('/xxx/:aid/:bid', ['xxx', new Param('aid'), new Param('bid')]))
  t.plan(5)
  t.end()
})

test('path.check', async (t) => {
  const path = Path.build('/plop/:id')

  t.deepEqual(path.check(['plop', '42']), new Parsed('/plop/:id', { 'id': '42' }))
  t.deepEqual(path.check(['test', 'test']), undefined)

  t.plan(2)
  t.end()
})

test('Router.route', async (t) => {
  const router = new Router()
  let count = 0

  router.on('/', () => {
    t.deepEqual(count, 0)
    t.ok(true)
    count++
  })

  router.on('/home', () => {
    t.deepEqual(count, 1)
    t.ok(true)
    count++
  })

  router.on('/plop/:id', ({ id }) => {
    t.deepEqual(count, 2)
    t.deepEqual(id, '13')
    count++
  })

  // must be global to mimic browser behavior
  // eslint-disable-next-line no-undef
  global.window = { location: { hash: '/' } }

  router.route()

  router.go('/home')
  router.route()

  router.go('/plop/13')
  router.route()

  t.deepEqual(count, 3)
  t.plan(7)
  t.end()
})

