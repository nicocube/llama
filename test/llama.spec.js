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

test('llama', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/other',
    })
    const eventBus = new EventBus()

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window

    const router = await new Promise((resolve, reject) => {
      class OtherComponent extends Component {
        init() { t.ok(true); if (this.logger) this.logger.log('in other'); resolve(conf) }
      }
      const conf = llama({
        box: dom.window.document.getElementById('app'),
        context: {},
        eventBus,
        routes: {
          '/': { name: 'main', onload() { if (this.logger) this.logger.log('in main'); resolve(conf) } },
          '/other': OtherComponent,
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            type: Component,
            html: '404 Page not found',
            onload() { if (this.logger) this.logger.log('in not-found'); reject('not found') }
          },
        },
        // logger: console
      })
      conf.run()
    })
    t.ok(true)
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