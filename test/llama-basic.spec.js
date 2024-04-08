/*
 * Copyright 2023 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
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
import { JSDOM } from 'jsdom'

import llama, { Component, EventBus, Router } from '../index.js'

test('llama flat routes: Object definition', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/',
    })

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    let count = 0

    const router = await new Promise((resolve, reject) => {
      class OtherComponent extends Component {
        init() {
          t.fail('should not be here')
          reject('wrong place')
        }
      }
      const conf = llama({
        context: {},
        routes: {
          '/': {
            name: 'main',
            onLoad() {
              t.deepEqual(count, 0)
              count++
              if (this.logger) this.logger.log('in main')
              resolve(conf)
            }
          },
          '/other': OtherComponent,
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            html: '404 Page not found',
            onLoad() {
              t.fail('should not be here')
              reject('wrong place')
            }
          },
        },
        // logger: console
      })
      conf.run()

      // if nothing resolved before 500ms, let's get out
      setTimeout(() => reject(new Error('Failed to find route')), 500)
    })
    t.deepEqual(count, 1)
    // window.location.hash = '/other'

    router.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(2)
    t.end()
  }
})

test('llama flat routes: Component class definition', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/other',
    })

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    let count = 0

    const router = await new Promise((resolve, reject) => {
      class OtherComponent extends Component {
        init() {
          t.deepEqual(count, 0)
          count++
          if (this.logger) this.logger.log('in other')
          resolve(conf)
        }
      }
      const conf = llama({
        context: {},
        routes: {
          '/': {
            name: 'main',
            onLoad() {
              t.fail('should not be here')
              reject('wrong place')
            }
          },
          '/other': OtherComponent,
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            html: '404 Page not found',
            onLoad() {
              t.fail('should not be here')
              reject('wrong place')
            }
          },
        },
        // logger: console
      })
      conf.run()

      // if nothing resolved before 500ms, let's get out
      setTimeout(() => reject(new Error('Failed to find route')), 500)
    })
    t.deepEqual(count, 1)
    // window.location.hash = '/other'

    router.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(2)
    t.end()
  }
})


test('llama flat routes: NOT FOUND', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/XCVB',
    })
    const eventBus = new EventBus()

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document


    let count = 0

    const router = await new Promise((resolve, reject) => {
      class OtherComponent extends Component {
        init() {
          t.fail('should not be here')
          reject('wrong place')
        }
      }
      const conf = llama({
        context: {},
        eventBus,
        routes: {
          '/': {
            name: 'main',
            onLoad() {
              t.fail('should not be here')
              reject('wrong place')
            }
          },
          '/other': OtherComponent,
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            html: (args, path) => `404 Page not found: ${path}`,
            onLoad() {
              t.deepEqual(count, 0)
              count++
              if (this.logger) this.logger.log('in not-found')
              resolve(conf)
            }
          },
        },
        // logger: console
      })
      conf.run()

      // if nothing resolved before 500ms, let's get out
      setTimeout(() => reject(new Error('Failed to find route')), 500)
    })
    t.deepEqual(count, 1)
    // window.location.hash = '/other'

    t.deepEqual(dom.window.document.getElementById('app').shadowRoot.innerHTML, '404 Page not found: /XCVB')

    router.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(3)
    t.end()
  }
})
