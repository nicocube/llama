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

// JSDocs
// eslint-disable-next-line no-unused-vars
import EventBus from './event-bus.js'


export default class Component {
  static LOAD = 'llama-component-load'

  /**
   * Common ground for vanilla Widget Component
   *
   * @param {Object} options a set of option al
   * @param {string} [options.name] name of the component to serve as source for event listeners
   * @param {EventBus} options.eventBus to receive and send events
   * @param {ShadowRoot} options.box
   * @param {string|(context,...param)=>{}} [options.html]
   * @param {string} [options.css]
   * @param {Object.<string,any>} [options.context]
   * @param {(...param)=>{}} [options.onload]
   * @param {Console} [options.logger] define a logger, can be {logger: console} to send on the javascript console
   */
  constructor(options = {}) {
    this.name = options?.name || this.constructor.name
    this.eventBus = options?.eventBus
    this.box = options?.box
    this.html = options?.html
    this.css = options?.css
    this.context = options?.context
    this.logger = options?.logger
    this.onload = options?.onload
    this.children = []
    this.parent = true
    this.active = false
    this.on(Component.LOAD)?.before((loadingComponent) => {
      if (this.logger) this.logger.debug('before', this.name, this.active, this.parent, loadingComponent !== this)
      if (this.active && this.parent && loadingComponent !== this) this.unload()
    })?.do((loadingComponent, param) => {
      if (this.logger) this.logger.debug('do', this.name, loadingComponent === this)
      if (loadingComponent === this) this.load(param)
    })
  }

  /**
   * Prepare the div element shadowRoot
   *
   * @param {HTMLDivElement} box the div we load components in
   */
  static prepare(box) {
    if (!box.shadowRoot) {
      box.attachShadow({ mode: 'open' })
      while (box.hasChildNodes()) {
        box.shadowRoot.appendChild(box.firstChild)
      }
    }
    return box.shadowRoot
  }

  /**
   * Call for loading of the component
   *
   * @param {...any} param
   */
  call(...param) {
    this.emit(Component.LOAD, this, param)
  }

  /**
   * Load component inside the box
   *
   * @param {...any} param
   */
  load(param) {
    if (this.logger) this.logger.debug(`${this.name}.load(`, ...param, ')')
    this.active = true
    // fill with HTML and CSS (if exists)
    this.populate(...param)

    // initiate the component
    if (this.logger) this.logger.debug(`${this.name}.init()`)
    this.init(...param)
  }

  /**
   * Unload component
   */
  unload() {
    if (this.logger) this.logger.debug(`${this.name}.unload()`)
    this.active = false
    this.clean()
  }

  populate(...param) {
    // fill box with HTML if necessary
    if (this.hasHTML()) {
      this.empty()
      this.injectCSS()
      this.injectHTML(this.box, ...param)
    }
  }

  /**
   *
   * @param {...Component} children
  */
  addChildren(...children) {
    children.forEach((child) => {
      this.children.push(child)
      if (this.logger) this.logger.debug(`${this.name}: ${child.name}.init()`)
      child.parent = false
      child.init()
    })
  }

  /**
   *
   * @param {Component} child
   * @param {boolean} [remove] = true
   */
  removeChildren(...children) {
    // eslint-disable-next-line no-param-reassign
    if (children.length === 0) children = this.children
    children.forEach((child) => {
      child.clean()
      const idx = this.children.indexOf(child)
      if (idx !== -1) {
        this.children.splice(idx, 1)
      }
    })
  }

  /**
   * init the component after appending to DOM
   */
  init(...param) {
    if (this.onload) this.onload(...param)
  }

  /**
   * clean the component after removing from DOM
   */
  clean() {
    // remove the listeners of this component in the eventBus
    this.eventBus?.clear(this.name, (k) => k !== Component.LOAD)
    // clean the children
    this.removeChildren()
    this.empty()
  }

  /**
   * Attach an event listener for this source component
   * @param {string|string[]} e the event(s) key(s) to attach the listener
   * @param {(...r) => {}} [f] the listener function
   */
  on(e, f) {
    return this.eventBus?.on(this.name, e, f)
  }

  /**
   * Emit an event for a given key that are sent to every attached events listeners
   * @param {string} k the event key
   * @param {...any} p the optional params
   */
  emit(k, ...p) {
    this.eventBus?.emit(k, ...p)
  }

  /**
   * @param {string} id
   * @returns {HTMLElement}
   */
  gId(id) {
    return this.box?.getElementById(id)
  }

  /**
   * @param {string} id
   * @param {*} evt
   * @param {*} cb
   */
  addEvtById(id, evt, cb) {
    this.gId(id)?.addEventListener(evt, cb)
  }


  /**
   * @returns {boolean}
   */
  hasHTML() {
    if (this.logger) this.logger.debug(`${this.name}: has HTML? ${typeof this.html !== 'undefined'}`)
    return (typeof this.html !== 'undefined')
  }


  /**
   * Clear the box contents
   * @param {Node} box
   */
  empty(box = this.box) {
    while (box.hasChildNodes()) {
      box.removeChild(box.firstChild)
    }
  }

  /**
   * Generate DOM Element from source HTML
   *
   * @param {string} html some HTML code
   * @returns {DocumentFragment} the generated DOM Element
   */
  fragmentFromHtml(html) {
    const fragment = document.createDocumentFragment()
      , template = document.createElement('template')
    template.innerHTML = html.trim() // Never return a text node of whitespace as the result
    // template.content.childNodes.forEach((node) => fragment.append(node))
    fragment.append(...template.content.childNodes)
    return fragment
  }


  /**
   * Inject component defined CSS into the box (if it exists)
   * @param {Node} box
   */
  injectCSS(box = this.box) {
    if (this.css) {
      const style = document.createElement('style')
      style.textContent = this.css
      if (this.logger) this.logger.debug(`${this.name}: inject CSS`)
      box.appendChild(style)
    } else {
      if (this.logger) this.logger.debug(`${this.name}: no CSS injected`)
    }
  }

  /**
   * Inject component defined HTML into the box (if it exists)
   * @param {Node} box
   */
  injectHTML(box = this.box, ...param) {
    if (this.html) {
      if (this.logger) this.logger.debug(`${this.name}: inject HTML (format:${typeof this.html})`)
      if (typeof this.html === 'string') {
        box.appendChild(this.fragmentFromHtml(this.html))
      } else if (typeof this.html === 'function') {
        box.appendChild(this.fragmentFromHtml(this.html(this.context, ...param)))
      }
    } else {
      if (this.logger) this.logger.debug(`${this.name}: no HTML injected`)
    }
  }
}