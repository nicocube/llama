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

// eslint-disable-next-line no-unused-vars
import EventBus from './event-bus.js'

const pathRx = /\/(?:(?::([0-9A-Za-z.+-]+))|([0-9A-Za-z.+-]+))/g
const urlRx = /\/([0-9A-Za-z.+-]+)/g

export class Param {
  constructor(name) {
    this.name = name
  }
  addTo(params, val) {
    params[this.name] = val
  }
}

export class Path {
  /**
   *
   * @param {string} path
   * @param {Array} path_parts
   */
  constructor(path, path_parts) {
    this.path = path
    this.path_parts = path_parts
  }
  static build(path) {
    const path_parts = []
    let parts
    while ((parts = pathRx.exec(path)) !== null) {
      if (typeof parts[1] !== 'undefined') {
        path_parts.push(new Param(parts[1]))
      } else if (typeof parts[2] !== 'undefined') {
        path_parts.push(parts[2])
      }
    }
    return new Path(path, path_parts)
  }

  check(parts) {
    if (parts.length === this.path_parts.length) {
      const params = {}
      if (this.path_parts.every((v, i) => {
        if (v instanceof Param) {
          v.addTo(params, parts[i])
          return true
        } else {
          return v === parts[i]
        }
      })) {
        return new Parsed(this.path, params)
      }
    }
  }
}

export class Parsed {
  constructor(path, params) {
    this.path = path
    this.params = params
  }
}

export default class Router {
  static GO = 'router-go'
  static LAND = 'router-land'
  static NOT_FOUND = 'router-notfound'

  /**
   *
   * @param {EventBus} evenBus
   * @param {object} [options]
   * @param {Console} [options.logger] define a logger, can be {logger: console} to send on the javascript console
   */
  constructor(evenBus, options) {
    /**
     * @property {Path[]} routes
     */
    this.routes = []
    this.actions = {}
    this.before_action = undefined
    this.evenBus = evenBus
    this.logger = options?.logger || undefined
  }

  before(action) {
    this.before_action = action
  }

  on(path, action) {
    if (this.logger) this.logger.log(`router.on(${path})`)
    this.routes.push(Path.build(path))
    this.actions[path] = action
  }

  run() {
    if (this.logger) this.logger.log('router.run()')
    this._route = () => this.route()
    window.addEventListener('hashchange', this._route)
    window.addEventListener('load', this._route)
    if (this.evenBus) this.evenBus.on('router', Router.GO, (path) => {
      this.go(path)
    })
  }

  stop() {
    window.removeEventListener('hashchange', this._route)
    window.removeEventListener('load', this._route)
  }

  go(path) {
    window.location.hash = path
  }

  async route() {
    if (this.logger) this.logger.log(`router.route(): ${window.location.hash}`)
    const path = window.location.hash || '/'


    const url_parts = []
    let parts
    while ((parts = urlRx.exec(path)) !== null) {
      if (parts[1] !== '') url_parts.push(parts[1])
    }

    let parsed
    for (const route of this.routes) {
      parsed = route.check(url_parts)
      if (parsed) break
    }

    if (typeof parsed === 'undefined' && (Router.NOT_FOUND in this.actions)) {
      if (this.evenBus) this.evenBus.emit(Router.LAND, Router.NOT_FOUND, { path })
      this.actions[Router.NOT_FOUND]({ path })
    } else {
      if (this.evenBus) this.evenBus.emit(Router.LAND, parsed.path, parsed.params)
      if (this.before_action) await this.before_action(parsed)

      await this.actions[parsed.path](parsed.params)
    }
  }
}
