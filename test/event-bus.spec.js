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

import test from 'tape'

import EventBus from '../event-bus.js'

const COUNT_EVENT = 'count'
test('Event bus', async (t) => {
  try {
    const eb = new EventBus(/** { logger: console }/**/)

    let count = 0

    eb.on('test', COUNT_EVENT, (r, n) => { count += n || 1; r() })
    t.deepEqual(count, 0)

    await new Promise((resolve) => {
      eb.emit(COUNT_EVENT, resolve)
    })
    t.deepEqual(count, 1)

    await new Promise((resolve) => {
      eb.emit(COUNT_EVENT, resolve, 2)
    })
    t.deepEqual(count, 3)

    eb.clear('plop')

    await new Promise((resolve) => {
      eb.emit(COUNT_EVENT, resolve, 3)
    })
    t.deepEqual(count, 6)

    eb.clear('test')

    await new Promise((resolve) => {
      eb.emit(COUNT_EVENT, resolve, 4)
      setTimeout(resolve, 100) // because no call of the event as we cleaned it
    })
    t.deepEqual(count, 6)
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(5)
    t.end()
  }
})
