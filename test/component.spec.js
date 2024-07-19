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

import { JSDOM } from 'jsdom'
import Component from '../component.js'
import EventBus from '../event-bus.js'
// import EventBus from '../event-bus.js'

test('Component.empty other', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>')

    const component = new Component()

    t.deepEqual(dom.window.document.getElementById('app').innerHTML, '<b>Hello world</b>')

    component.empty(dom.window.document.getElementById('app'))

    t.deepEqual(dom.window.document.getElementById('app').innerHTML, '')
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(2)
    t.end()
  }
})

test('Component.empty self', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>')

    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    const appBox = dom.window.document.getElementById('app')
    const component = new Component({})

    t.deepEqual(appBox.innerHTML, '<b>Hello world</b>')

    component.empty()

    t.deepEqual(appBox.innerHTML, '')
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(2)
    t.end()
  }
})

test('Component.injectCSS', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>')

    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    const component = new Component({
      css: '.plop { color: red; }'
    })

    component.injectCSS(document.getElementById('app'))

    t.deepEqual(dom.window.document.getElementById('app').innerHTML, '<b>Hello world</b><style>.plop { color: red; }</style>')
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(1)
    t.end()
  }
})

test('Component.injectHTML string', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"></div>')

    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    const component = new Component({
      html: '<b>Hello world</b>'
    })

    component.injectHTML(document.getElementById('app'))

    t.deepEqual(dom.window.document.getElementById('app').innerHTML, '<b>Hello world</b>')
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(1)
    t.end()
  }
})

test('Component.injectHTML function', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"></div>')

    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    const component = new Component({
      html: (a, b, { context }) => `<b>Hello ${context.txt}</b>`,
      context: { txt: 'Plop' }
    })
    component.injectHTML(document.getElementById('app'))

    t.deepEqual(dom.window.document.getElementById('app').innerHTML, '<b>Hello Plop</b>')
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(1)
    t.end()
  }
})

test('Component.injectHTML string + set children to zone + gId', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"></div>')

    // eslint-disable-next-line no-undef
    global.document = dom.window.document
    // eslint-disable-next-line no-undef
    global.window = dom.window

    const component = new Component({
      html: `<div>
  <div id="child00"><div id="in-child">HERE</div></div>
  <div id="child01"></div></div>
</div>`,
      box: 'app',
      context: {}
    })

    component.load()

    const child = new Component({
      box: 'child00'
    })

    component.addChildren(
      child,
      new Component({
        box: 'child01'
      })
    )

    const inChild = child.gId('in-child')

    t.deepEqual(inChild.innerHTML, 'HERE')
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(1)
    t.end()
  }
})

test('Component.unload', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"></div>')

    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    let count = 0
    const eventBus = new EventBus()

    const component = new Component({
      name: 'parent',
      eventBus,
      html: `<div>
  <div id="child00"><div id="in-child">HERE</div></div>
  <div id="child01"></div></div>
</div>`,
      onLoad () {
        if (this.logger) this.logger.log(`UT> ${this.name}.onLoad`)
        component.addChildren(
          new Component({
            name: 'child00',
            eventBus,
            box: 'child00',
            onLoad () {
              if (this.logger) this.logger.log(`UT> ${this.name}.onLoad`)
              this.on('X', () => {
                if (this.logger) this.logger.log(`UT> ${this.name}> event X`, count)
                if (count === 0) t.ok(true)
                else t.fail('should pass once')
              })
            }
          }),
          new Component({
            name: 'child01',
            eventBus,
            box: 'child01',
            onLoad () {
              if (this.logger) this.logger.log(`UT> ${this.name}.onLoad`)
              this.on('X', () => {
                if (this.logger) this.logger.log(`UT> ${this.name}> event X`, count)
                if (count === 0) t.ok(true)
                else t.fail('should pass once')
              })
            }
          })
        )

        this.on('X', () => {
          if (this.logger) this.logger.log(`UT> ${this.name}> event X`, count)
          if (count === 0) t.ok(true)
          else t.fail('should pass once')
        })
      }
    })

    eventBus.on('test', 'X', (resolve) => {
      resolve()
    })

    component.load()

    await new Promise((resolve) => {
      eventBus.emit('X', resolve)
    })

    count++

    component.unload()

    await new Promise((resolve) => {
      eventBus.emit('X', resolve)
    })
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(3)
    t.end()
  }
})
