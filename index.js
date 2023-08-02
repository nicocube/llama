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

import Component from './component.js'
import EventBus from './event-bus.js'
import Router from './router.js'

export {
  Component, EventBus, Router
}

/**
 * @typedef {Object} RouteTarget
 * @property {typeof Component} [type]
 * @property {string} [name] name of the component to serve as source for event listeners
 * @property {string|(context,...param)=>{}} [html]
 * @property {string} [css]
 * @property {(...param)=>{}} [onload]
 * @property {Console} [logger] define a logger, can be {logger: console} to send on the javascript console
 */

/**
 * Set all the Llama goodness together
 *
 * @param {Object} options
 * @param {HTMLDivElement} options.box the div we load components in
 * @param {EventBus} [options.eventBus]
 * @param {Object} options.context
 * @param {Object.<string, typeof Component|RouteTarget>} options.routes
 * @property {Console} [options.logger] define a logger, can be {logger: console} to send on the javascript console
 */
export default function llama(options) {
  const box = Component.prepare(options.box)
    , eventBus = options?.eventBus || new EventBus()
    , context = options.context

  const router = new Router(eventBus)

  for (const [path, target] of Object.entries(options.routes)) {
    if (typeof target === 'object') {
      const type = target.type || Component
      const opt = Object.assign({}, target, { box, eventBus, context })
      if (('logger' in options) && !('logger' in opt)) opt.logger = options.logger
      const component = new type(opt)
      router.on(path, (...param) => component.call(...param))
    } else {
      const opt = { box, eventBus, context }
      if (('logger' in options) && !('logger' in opt)) opt.logger = options.logger
      const component = new target(opt)
      router.on(path, (...param) => component.call(...param))
    }
  }

  return router
}
