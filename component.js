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
   * @param {HTMLElement|ShadowRoot|string} options.box
   * @param {string|(context: object, params: object, path: string)=>{}} [options.html]
   * @param {string} [options.css]
   * @param {Object.<string,any>} [options.context]
   * @param {(params: object, path: string)=>{}} [options.onload]
   * @param {(params: object, path: string)=>{}} [options.onPostLoad]
   * @param {Console} [options.logger] define a logger, can be {logger: console} to send on the javascript console
   */
  constructor(options = {}) {
    this.id = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')
    this.name = options?.name || this.constructor.name
    this.eventBus = options?.eventBus
    this.box = options?.box
    this.html = options?.html
    this.css = options?.css
    this.context = options?.context || {}
    this.logger = options?.logger
    this.onload = options?.onload
    this.onPostLoad = options?.onPostLoad
    this.children = []
    this.parent = undefined
    this.active = false
    this.listening = false
    if (this.logger) this.logger.info(`${this.name}: created, id:${this.id}`)
  }

  listen() {
    if (!this.listening) {
      this.listening = true
      if (this.logger) this.logger.info(`${this.name}: listening`)
      this.on(Component.LOAD).before((loadingComponent, params, path) => {
        const isNotMe = loadingComponent !== this
        const isUnloading = this.active && isNotMe
        if (this.logger) this.logger.debug(`${this.name}: unload? ${isUnloading} (active: ${this.active}, isNotMe: ${isNotMe})`)
        if (isUnloading) this.unload(path)
      })?.do((loadingComponent, params, path) => {
        if (loadingComponent === this) {
          if (this.logger) this.logger.info(`${this.name}.load(${JSON.stringify(params)}, ${path} )`)
          this.load(params, path)
          if (this.logger) this.logger.info(`${this.name}.postLoad(${JSON.stringify(params)}, ${path} )`)
          this.postLoad(params, path)
        }
      })
    }
  }

  /**
   * Call for loading of the component
   *
   * @param {object} params
   * @param {string} path
   */
  call(params, path) {
    if (this.logger) this.logger.debug(`${this.name}: calling(${JSON.stringify(params)}, ${path})`)
    this.emit(Component.LOAD, this, params, path)
  }

  /**
   * Load component inside the box
   *
   * @params {object} params
   */
  load(params, path) {
    this.active = true
    // fill with HTML and CSS (if exists)
    this.populate(params, path)

    // initiate the component
    if (this.logger) this.logger.debug(`${this.name}.init()`)
    this.init(params, path)
  }

  /**
   * Unload component
   */
  unload() {
    if (this.logger) this.logger.info(`${this.name}.unload()`)
    this.active = false
    // remove the listeners of this component in the eventBus
    this.clean()
  }

  prepareBox() {
    if (this.logger) this.logger.debug(`${this.name}: prepare id='${typeof this.box === 'string'
      ? this.box
      : this.box.host
        ? this.box.host.id
        : this.box.id
    }'`)
    // no parent
    if (!this.parent) {
      if (!(this.box instanceof window.ShadowRoot)) {
        let tmp = this.box
        if (typeof this.box === 'string') {
          tmp = document.getElementById(this.box)
        }
        if (!tmp.shadowRoot) {
          tmp.attachShadow({ mode: 'open' })
          while (tmp.hasChildNodes()) {
            tmp.shadowRoot.appendChild(tmp.firstChild)
          }
        }
        this.box = tmp.shadowRoot
      }
      return this.box
    } else {
      if (typeof this.box === 'string') {
        const tmp = this.parent.gId(this.box)
        if (tmp) this.box = tmp
      }
      return this.box
    }

  }

  populate(params, path) {
    if (this.logger) this.logger.debug(`${this.name}.populate()`)
    // fill box with HTML if necessary
    if (this.hasHTML()) {
      const box = this.prepareBox()
      this.empty(box)
      this.injectCSS(box)
      this.injectHTML(box, params, path)
    }
  }

  /**
   *
   * @param {object} [params]
   * @param {string} [path]
   * @param {...Component} children
  */
  addChildren(params, path, ...children) {
    if (path instanceof Component) children.unshift(path)
    if (params instanceof Component) children.unshift(params)
    children.forEach((child) => {
      child.parent = this
      this.children.push(child)
      if (this.logger) this.logger.debug(`${this.name}: ${child.name}.load()`)
      child.load(params, path)
    })
    if (this.logger) this.logger.log(`${this.name}.addChildren:`, this.children.map(x => x.name))
  }

  /**
   *
   * @param {...Component} children
  */
  removeChildren(...children) {
    // eslint-disable-next-line no-param-reassign
    if (children.length === 0) children = this.children.slice()
    if (this.logger) this.logger.log(`${this.name}.removeChildren:`, this.children.map(x => x.name))
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
  init(params, path) {
    if (this.onload) this.onload(params, path)
  }

  /**
   * activate after load
   */
  postLoad(params, path) {
    if (this.onPostLoad) this.onPostLoad(params, path)
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
    if (this.parent) {
      if (this.logger) this.logger.debug(`${this.name}: gId search in parent: ${this.parent.name} (${id})`)
      return this.parent.gId(id)
    }
    else {
      const box = this.prepareBox()
      if (this.logger) this.logger.debug(`${this.name}: gId (${id})`)
      return box.getElementById(id)
    }
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
  empty(box = this.prepareBox()) {
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
  injectCSS(box = this.prepareBox()) {
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
  injectHTML(box = this.prepareBox(), params, path) {
    if (this.html) {
      if (this.logger) this.logger.debug(`${this.name}: inject HTML (format:${typeof this.html})`)
      if (typeof this.html === 'string') {
        box.appendChild(this.fragmentFromHtml(this.html))
      } else if (typeof this.html === 'function') {
        box.appendChild(this.fragmentFromHtml(this.html(this.context, params, path)))
      }
    } else {
      if (this.logger) this.logger.debug(`${this.name}: no HTML injected`)
    }
  }

  toString() {
    return `${this.constructor.name}{ ${this.name} }`
  }
}

export class HostComponent extends Component {

  /**
   *
   * @param {Object.<string, number>} subRoute
   */
  setSubRoute(subRoute) {
    this.subRoute = subRoute
    Object.values(this.subRoute).forEach((sub) => {
      sub.parent = this
      if (sub instanceof HostComponent) {
        Object.keys(sub.getSubRoute()).forEach(path => {
          this.subRoute[path] = sub
        })
      }
    })

    if (this.logger) this.logger.debug(`${this.name}.subRoute:`, Object.fromEntries(Object.entries(subRoute).map(([p, x]) => ([p, x.name]))))
  }

  getSubRoute() {
    return this.subRoute
  }

  getSubComponent(path) {
    return this.getSubRoute()[path]
  }

  load(params, path) {
    if (!this.active) {
      super.load(params, path)
    }
    if (this.logger) this.logger.debug(`${this.name}: load embedded`)

    const sub = this.getSubComponent(path)
    if (sub) {
      sub.parent = this
      this.children.push(sub)
      sub.listen()
      if (this.logger) this.logger.debug(`${this.name}: ${sub.name}.load(${JSON.stringify(params)},${path})`)
      sub.load(params, path)
      if (sub.postLoad) {
        if (sub.logger) this.logger.debug(`${this.name}: ${sub.name}.postLoad(${JSON.stringify(params)}, ${path} )`)
        sub.postLoad(params, path)
      }
    }
  }

  unload(path) {
    if (! this.parent) super.unload()
    else {
      const sub = this.getSubComponent(path)
      if (!sub) {
        // remove the listeners of this component in the eventBus
        this.eventBus?.clear(this.name, (k) => k !== Component.LOAD)
        super.unload()
      }
    }
  }

}