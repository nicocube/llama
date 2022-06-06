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
  /**
   * Common ground for vanilla Widget Component
   *
   * @param {string} name name of the component to serve as source for event listeners
   * @param {EventBus} eventBus to receive and send events
   */
  constructor(name, eventBus) {
    this.name = name
    this.eventBus = eventBus
    /**
     * @property {ShadowRoot|undefined} box
     */
    this.box = undefined
    /**
     * @property {string|function|undefined} html
     */
    this.html = undefined
    /**
     * @property {string|undefined} css
     */
    this.css = undefined
    /**
     * @property {Object.<string,any>|undefined} context
     */
    this.context = undefined
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
   * @returns {boolean}
   */
  hasHTML() {
    console.log(`${this.constructor.name}: has HTML? ${typeof this.html !== 'undefined'}`)
    return (typeof this.html !== 'undefined')
  }

  /**
   * @param {ShadowRoot} shadowRoot
   */
  injectCSS(shadowRoot) {
    if (this.css) {
      const style = document.createElement('style')
      style.textContent = this.css
      console.warn(`${this.constructor.name}: inject CSS`)
      shadowRoot.appendChild(style)
    } else {
      console.warn(`${this.constructor.name}: no CSS injected`)
    }
  }

  /**
   * @param {ShadowRoot} shadowRoot
   */
  injectHTML(shadowRoot) {
    if (this.html) {
      console.warn(`${this.constructor.name}: inject HTML (format:${typeof this.html})`)
      if (typeof this.html === 'string') {
        shadowRoot.appendChild(this.fragmentFromHtml(this.html))
      } else if (typeof this.html === 'function') {
        shadowRoot.appendChild(this.fragmentFromHtml(this.html(this.context ? this.context : undefined)))
      }
    } else {
      console.warn(`${this.constructor.name}: no HTML injected`)
    }
  }

  /**
   * @param {ShadowRoot} box
   */
  setBox(box) {
    this.box = box
  }

  /**
   * init the component after appending to DOM
   */
  init() {
    // TODO empty impl to avoid runtime error, could be better
  }

  /**
   * clear the component after removing from DOM
   */
  clean() {
    // remove the listeners of this component in the eventBus
    this.eventBus.clear(this.name)
  }

  /**
   * Attach an event listener for this source component
   * @param {string|string[]} e the event(s) key(s) to attach the listener
   * @param {(...r) => {}} f the listener function
   */
  on(e, f) {
    this.eventBus.on(this.name, e, f)
  }

  /**
   * Emit an event for a given key that are sent to every attached events listeners
   * @param {string} k the event key
   * @param  {...any} p the optional params
   */
  emit(k, ...p) {
    this.eventBus.emit(k, ...p)
  }

  /**
   * @param {string} id
   * @returns {HTMLElement}
   */
  gId(id) {
    return this.box.getElementById(id)
  }

  /**
   * @param {string} id
   * @param {*} evt
   * @param {*} cb
   */
  addEvtById(id, evt, cb) {
    this.gId(id).addEventListener(evt, cb)
  }

}