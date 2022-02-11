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
      // console.log(parts)
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

  /**
   *
   * @param {EventBus} evenBus
   */
  constructor(evenBus) {
    this.routes = []
    this.actions = {}
    this.before_action = undefined
    this.evenBus = evenBus
  }

  before(action) {
    this.before_action = action
  }

  on(path, action) {
    this.routes.push(Path.build(path))
    this.actions[path] = action
  }

  run() {
    window.addEventListener('hashchange', () => this.route())
    window.addEventListener('load', () => this.route())
    this.evenBus.on('router', Router.GO, (path) => {
      this.go(path)
    })
  }

  go(path) {
    window.location.hash = path
  }

  async route() {
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

    if (typeof parsed === 'undefined' && ('unknown' in this.actions)) {
      this.actions['unknown'](parsed.params)
    } else {
      if (this.before_action) this.before_action(parsed)
      this.actions[parsed.path](parsed.params)
    }
  }
}
