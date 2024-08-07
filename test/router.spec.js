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

import test from 'tape'

import Router, { Path, Param, Parsed } from '../router.js'

test('Path.build', async (t) => {
  try {
    t.deepEqual(Path.build('/'), new Path('/', []))
    t.deepEqual(Path.build('/plop/:id'), new Path('/plop/:id', ['plop', new Param('id')]))
    t.deepEqual(Path.build('/:foo/:bar'), new Path('/:foo/:bar', [new Param('foo'), new Param('bar')]))
    t.deepEqual(Path.build('/test/:id/re/:mid'), new Path('/test/:id/re/:mid', ['test', new Param('id'), 're', new Param('mid')]))
    t.deepEqual(Path.build('/xxx/:aid/:bid'), new Path('/xxx/:aid/:bid', ['xxx', new Param('aid'), new Param('bid')]))
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(5)
    t.end()
  }
})

test('path.check', async (t) => {
  try {
    const path = Path.build('/plop/:id')

    t.deepEqual(path.check(['plop', '42']), new Parsed('/plop/:id', { id: '42' }))
    t.deepEqual(path.check(['test', 'test']), undefined)
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(2)
    t.end()
  }
})

test('Router.route', async (t) => {
  try {
    const router = new Router()
    let count = 0

    // must be global to mimic browser behavior
    global.window = { location: { hash: '/' } }

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

    await router.route()

    router.go('/home')
    await router.route()

    router.go('/plop/13')
    await router.route()

    t.deepEqual(count, 3)

    // clean after usage
    delete global.window
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(7)
    t.end()
  }
})
