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
import { HostComponent } from '../component.js'


test('llama with embedded routes: pure Object definition', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/in/plop',
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
        box: 'app',
        context: {},
        eventBus,
        routes: {
          '/': {
            name: 'main',
            html: '<b>Main</b><div id="sub"></div>',
            onload() {
              t.deepEqual(count, 0)
              count++
              if (this.logger) this.logger.log('in main')
            },
            embed: {
              'in/:id': {
                name: 'inside',
                html: (ctx, params, path) => `in ${path} with ${JSON.stringify(params)}`,
                onload({ id }) {
                  t.deepEqual(count, 1)
                  t.deepEqual(id, 'plop')
                  count++
                  if (this.logger) this.logger.log('in plop')
                  resolve(conf)
                }
              }
            }
          },
          '/other': OtherComponent,
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            type: Component,
            html: '404 Page not found',
            onload() {
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
    t.deepEqual(count, 2)
    // window.location.hash = '/other'

    t.deepEqual(
      dom.window.document.getElementById('app').shadowRoot.innerHTML,
      '<b>Main</b><div id="sub">in /in/:id/ with {"id":"plop"}</div>'
    )

    router.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(5)
    t.end()
  }
})

test('llama with embedded routes: pure Object definition, default subroute', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/',
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
        box: 'app',
        context: {},
        eventBus,
        routes: {
          '/': {
            name: 'main',
            html: '<b>Main</b><div id="sub"></div>',
            onload() {
              t.deepEqual(count, 0)
              count++
              if (this.logger) this.logger.log('in main')
            },
            embed: {
              '': {
                name: 'default',
                html: (ctx, params, path) => `in default ${path}`,
                onload() {
                  t.deepEqual(count, 1)
                  count++
                  if (this.logger) this.logger.log('in plop')
                  resolve(conf)
                }
              },
              'in/:id': {
                name: 'inside',
                html: (ctx, params, path) => `in ${path} with ${JSON.stringify(params)}`,
                onload() {
                  t.fail('should not be here')
                  reject('wrong place')
                }
              }
            }
          },
          '/other': OtherComponent,
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            type: Component,
            html: '404 Page not found',
            onload() {
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
    t.deepEqual(count, 2)
    // window.location.hash = '/other'

    t.deepEqual(
      dom.window.document.getElementById('app').shadowRoot.innerHTML,
      '<b>Main</b><div id="sub">in default /</div>'
    )

    router.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(4)
    t.end()
  }
})

test('llama with embedded routes: pure Object definition, deep', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/deep/foo/in/plop',
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
            sub_box: 'my-sub',
            html: '<b>Main</b><div id="my-sub"></div>',
            onload() {
              t.deepEqual(count, 0)
              count++
              if (this.logger) this.logger.log('in main')
            },
            embed: {
              'deep/:id/': {
                name: 'deep',
                sub_box: 'in-deep',
                html: (ctx, params) => `<b>Deep: ${params.id}</b><div id="in-deep"></div>`,
                onload({ id }) {
                  t.deepEqual(count, 1)
                  t.deepEqual(id, 'plop')
                  count++
                  if (this.logger) this.logger.log('in deep')
                },
                embed: {
                  'in/:id': {
                    name: 'inside',
                    html: (ctx, params, path) => `in ${path} with ${JSON.stringify(params)}`,
                    onload({ id }) {
                      t.deepEqual(count, 2)
                      t.deepEqual(id, 'plop')
                      count++
                      if (this.logger) this.logger.log('in plop')
                      resolve(conf)
                    }
                  }
                }
              }
            }
          },
          '/other': OtherComponent,
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            type: Component,
            html: '404 Page not found',
            onload() {
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
    t.deepEqual(count, 3)
    // window.location.hash = '/other'

    t.deepEqual(
      dom.window.document.getElementById('app').shadowRoot.innerHTML,
      '<b>Main</b><div id="my-sub"><b>Deep: plop</b><div id="in-deep">in /deep/:id/in/:id/ with {"id":"plop"}</div></div>'
    )

    router.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(7)
    t.end()
  }
})

test('llama with embedded routes: pure Object definition, change sub', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/in/plop',
    })
    const eventBus = new EventBus()

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    let count = 0

    const router2 = await new Promise((resolve2, reject2) => {
      new Promise((resolve, reject) => {
        class OtherComponent extends Component {
          init() {
            t.fail('should not be here')
            reject('wrong place')
          }
        }
        const conf = llama({
          box: 'app',
          context: {},
          eventBus,
          routes: {
            '/': {
              name: 'main',
              html: '<b>Main</b><div id="sub"></div>',
              onload() {
                count++
                if (this.logger) this.logger.log('in main')
              },
              embed: {
                'in/:id': {
                  name: 'inside',
                  html: (ctx, params, path) => `in ${path} with ${JSON.stringify(params)}`,
                  onload({ id }) {
                    t.deepEqual(count, 1)
                    t.deepEqual(id, 'plop')
                    count++
                    if (this.logger) this.logger.log('in plop')
                    resolve(conf)
                  }
                },
                'sub/:id': {
                  name: 'sub',
                  html: (ctx, params, path) => `in another ${path} with ${JSON.stringify(params)}`,
                  onload({ id }) {
                    t.deepEqual(count, 2)
                    t.deepEqual(id, 'foo')
                    count++
                    if (this.logger) this.logger.log('in foo')
                    resolve2(conf)
                  }
                }
              }
            },
            '/other': OtherComponent,
            [Router.NOT_FOUND]: {
              name: Router.NOT_FOUND,
              type: Component,
              html: '404 Page not found',
              onload() {
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
      }).then(() => {
        // console.log('--here--')
        t.deepEqual(count, 2)

        t.deepEqual(
          dom.window.document.getElementById('app').shadowRoot.innerHTML,
          '<b>Main</b><div id="sub">in /in/:id/ with {"id":"plop"}</div>'
        )

        window.location.hash = '/sub/foo'

        setTimeout(() => { reject2(new Error('Failed to find route 2')) }, 500)
      }).catch((r) => { reject2(r) })
    })
    t.deepEqual(count, 3)

    t.deepEqual(
      dom.window.document.getElementById('app').shadowRoot.innerHTML,
      '<b>Main</b><div id="sub">in another /sub/:id/ with {"id":"foo"}</div>'
    )

    // console.log('--there--')
    router2.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(8)
    t.end()
  }
})

test('llama with embedded routes: pure Object definition, change sub, depth 2', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/deep',
    })
    const eventBus = new EventBus()

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    let count = 0

    const router2 = await new Promise((resolve2, reject2) => {
      new Promise((resolve, reject) => {
        class OtherComponent extends Component {
          init() {
            t.fail('should not be here')
            reject('wrong place')
          }
        }
        const conf = llama({
          box: 'app',
          context: {},
          eventBus,
          routes: {
            '/': {
              name: 'main',
              html: '<b>Main</b><div id="sub"></div>',
              onload() {
                count++
                if (this.logger) this.logger.log('UT> in main')
              },
              onPostLoad(params, path) {
                if (count === 3) t.deepEqual(path, '/deep/')
                else if (count === 4) t.deepEqual(path, '/deep/sub/:id/')
                else {
                  t.fail('should not be here')
                }
              },
              embed: {
                '': {
                  name: 'default',
                  html: (ctx, params, path) => `default page ${path} with ${JSON.stringify(params)}`,
                  onload() {
                    t.fail('should not be here')
                    reject('wrong place')
                  }
                },
                'deep': {
                  name: 'deep',
                  sub_box: 'deep-sub',
                  html: '<b>Deep</b><div id="deep-sub"></div>',
                  onload(params, path) {
                    if (path === '/deep/') t.deepEqual(count, 1)
                    else t.fail(`should not be here ${path} ${params}`)
                    count++
                    if (this.logger) this.logger.log('UT> in deep')
                    resolve(conf)
                  },
                  onPostLoad(params, path) {
                    if (count === 3) t.deepEqual(path, '/deep/')
                    else if (count === 4) t.deepEqual(path, '/deep/sub/:id/')
                    else {
                      t.fail('should not be here')
                    }
                  },
                  embed: {
                    '': {
                      name: 'inside',
                      html: (ctx, params, path) => `inside ${path} with ${JSON.stringify(params)}`,
                      onload() {
                        t.deepEqual(count, 2)
                        count++
                        if (this.logger) this.logger.log('UT> in plop')
                        resolve(conf)
                      }
                    },
                    'sub/:id': {
                      name: 'sub',
                      html: (ctx, params, path) => `in another ${path} with ${JSON.stringify(params)}`,
                      onload({ id }) {
                        t.deepEqual(count, 3)
                        t.deepEqual(id, 'foo')
                        count++
                        if (this.logger) this.logger.log('UT> in foo')
                        resolve2(conf)
                      }
                    }
                  }
                },
              }
            },
            '/other': OtherComponent,
            [Router.NOT_FOUND]: {
              name: Router.NOT_FOUND,
              type: Component,
              html: '404 Page not found',
              onload() {
                t.fail('should not be here')
                reject('wrong place')
              }
            },
          },
          //logger: console
        })
        conf.run()

        // if nothing resolved before 500ms, let's get out
        setTimeout(() => reject(new Error('Failed to find route')), 500)
      }).then(() => {
        t.deepEqual(count, 3)

        t.deepEqual(
          window.document.getElementById('app').shadowRoot.innerHTML,
          '<b>Main</b><div id="sub"><b>Deep</b><div id="deep-sub">inside /deep/ with {}</div></div>'
        )

        // console.log('--here--')
        window.location.hash = '/deep/sub/foo'

        setTimeout(() => { reject2(new Error('Failed to find route 2')) }, 500)
      }).catch((r) => { reject2(r) })
    })
    // console.log('--there--')
    t.deepEqual(count, 4)

    t.deepEqual(
      dom.window.document.getElementById('app').shadowRoot.innerHTML,
      '<b>Main</b><div id="sub"><b>Deep</b><div id="deep-sub">in another /deep/sub/:id/ with {"id":"foo"}</div></div>'
    )

    // console.log('--there--')
    router2.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(12)
    t.end()
  }
})


test('llama with embedded routes: pure Object definition, change other', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/in/plop',
    })
    const eventBus = new EventBus()

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    let count = 0

    const router2 = await new Promise((resolve2, reject2) => {
      new Promise((resolve, reject) => {
        class OtherComponent extends Component {
          init() {
            t.deepEqual(count, 2)
            count++
            if (this.logger) this.logger.log('in other')
            resolve2(conf)
          }
        }
        const conf = llama({
          box: 'app',
          context: {},
          eventBus,
          routes: {
            '/': {
              name: 'main',
              html: '<b>Main</b><div id="sub"></div>',
              onload() {
                count++
                if (this.logger) this.logger.log('in main')
              },
              embed: {
                'in/:id': {
                  name: 'inside',
                  html: (ctx, params, path) => `in ${path} with ${JSON.stringify(params)}`,
                  onload({ id }) {
                    t.deepEqual(count, 1)
                    t.deepEqual(id, 'plop')
                    count++
                    if (this.logger) this.logger.log('in plop')
                    resolve(conf)
                  }
                },
                'sub/:id': {
                  name: 'sub',
                  html: (ctx, params, path) => `in another ${path} with ${JSON.stringify(params)}`,
                  onload() {
                    t.fail('should not be here')
                    reject2('wrong place')
                  }
                }
              }
            },
            '/other': OtherComponent,
            [Router.NOT_FOUND]: {
              name: Router.NOT_FOUND,
              type: Component,
              html: '404 Page not found',
              onload() {
                t.fail('should not be here')
                reject2('wrong place')
              }
            },
          },
          // logger: console
        })
        conf.run()

        // if nothing resolved before 500ms, let's get out
        setTimeout(() => reject(new Error('Failed to find route')), 500)
      }).then(() => {
        // console.log('--here--')
        t.deepEqual(count, 2)

        t.deepEqual(
          dom.window.document.getElementById('app').shadowRoot.innerHTML,
          '<b>Main</b><div id="sub">in /in/:id/ with {"id":"plop"}</div>'
        )

        window.location.hash = '/other'

        setTimeout(() => { reject2(new Error('Failed to find route 2')) }, 500)
      }).catch((r) => { reject2(r) })
    })

    // console.log('--there--')
    router2.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(5)
    t.end()
  }
})


test('llama with embedded routes: Component class definition root', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/other/foobar',
    })
    const eventBus = new EventBus()

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    let count = 0

    const router = await new Promise((resolve, reject) => {

      class OtherComponent extends HostComponent {
        constructor(opt) {
          super(Object.assign({}, opt, {
            html: '<b>Other</b><div id="sub"></div>',
          }))
        }
        init() {
          t.deepEqual(count, 0)
          count++
          if (this.logger) this.logger.log('in other')
          resolve(conf)
        }
      }

      const conf = llama({
        context: { plop: 'some context' },
        eventBus,
        routes: {
          '/': {
            name: 'main',
            onload() {
              t.fail('should not be here')
              reject('wrong place')
            }
          },
          '/other': {
            type: OtherComponent,
            embed: {
              '/:id': {
                name: 'inside',
                html: (ctx, { id }, path) => `inside obj def ${ctx.plop} id:${id} for ${path}`,
                onload({ id }) {
                  t.deepEqual(count, 1)
                  t.deepEqual(id, 'foobar')
                  count++
                  if (this.logger) this.logger.log('in other')
                  resolve(conf)
                }
              }
            }
          },
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            html: '404 Page not found',
            onload() {
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
    t.deepEqual(count, 2)
    // window.location.hash = '/other'

    t.deepEqual(
      dom.window.document.getElementById('app').shadowRoot.innerHTML,
      '<b>Other</b><div id="sub">inside obj def some context id:foobar for /other/:id/</div>'
    )

    router.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(5)
    t.end()
  }

})

test('llama with embedded routes: Component class definition root and embedded', async (t) => {
  try {
    const dom = new JSDOM('<!DOCTYPE html><div id="app"><b>Hello world</b></div>', {
      url: 'http://localhost/#/other/barbar',
    })
    const eventBus = new EventBus()

    // must be global to mimic browser behavior
    // eslint-disable-next-line no-undef
    global.window = dom.window
    // eslint-disable-next-line no-undef
    global.document = dom.window.document

    let count = 0

    const router = await new Promise((resolve, reject) => {

      class OtherComponent extends HostComponent {
        constructor(opt) {
          super(Object.assign({}, opt, {
            html: '<b>Other</b><div id="sub"></div>',
          }))
        }
        init() {
          t.deepEqual(count, 0)
          count++
          if (this.logger) this.logger.log('UT> in other', count)
        }
        postLoad() {
          if (this.logger) this.logger.log('UT> post', count)
          t.deepEqual(count, 2)
          count++
        }
      }
      class InsideComponent extends Component {
        constructor(opt) {
          super(Object.assign({}, opt, {
            html: (ctx, { id }, path) => `inside component ${ctx.plop} id:${id} for ${path}`,
          }))
        }
        init({ id }) {
          t.deepEqual(count, 1)
          t.deepEqual(id, 'barbar')
          count++
          if (this.logger) this.logger.log('UT> in other>inside', count)
          resolve(conf)
        }
      }

      const conf = llama({
        box: 'app',
        context: { plop: 'some new context' },
        eventBus,
        routes: {
          '/': {
            name: 'main',
            onload() {
              t.fail('should not be here')
              reject('wrong place')
            }
          },
          '/other': {
            type: OtherComponent,
            embed: {
              '/:id': InsideComponent
            }
          },
          [Router.NOT_FOUND]: {
            name: Router.NOT_FOUND,
            html: '404 Page not found',
            onload() {
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
    t.deepEqual(count, 3)
    // window.location.hash = '/other'

    t.deepEqual(
      dom.window.document.getElementById('app').shadowRoot.innerHTML,
      '<b>Other</b><div id="sub">inside component some new context id:barbar for /other/:id/</div>'
    )

    router.stop()

    // clean after usage
    // eslint-disable-next-line no-undef
    delete global.window

  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(6)
    t.end()
  }

})

