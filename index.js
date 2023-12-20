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

import Component, { HostComponent } from './component.js'
import EventBus from './event-bus.js'
import Router from './router.js'

export {
  Component, HostComponent, EventBus, Router
}

/**
 * @typedef {Object} RouteTarget
 * @property {typeof Component} [type]
 * @property {string} [name] name of the component to serve as source for event listeners
 * @property {string|(context,...param)=>{}} [html]
 * @property {string} [css]
 * @property {(...param)=>{}} [onload]
 * @property {Console} [logger] define a logger, can be {logger: console} to send on the javascript console
 * @property {Object.<string, RouteTarget>} embed embedded route
 */

/**
 * Set all the Llama goodness together
 *
 * @param {Object} options
 * @param {HTMLDivElement} options.box the div we load components in
 * @param {EventBus} [options.eventBus]
 * @param {Object} options.context
 * @param {Object.<string, typeof Component|RouteTarget>} options.routes
 * @param {Console} [options.logger] define a logger, can be {logger: console} to send on the javascript console
 */
export default function llama(options) {
  const box = options.box || 'app'
    , eventBus = options?.eventBus || new EventBus()
    , context = options.context
    , routeOpt = Object.assign({}, ('logger' in options) ? { logger: options.logger } : {})

  const router = new Router(eventBus, routeOpt)

  for (const [path, target] of Object.entries(options.routes)) {
    if (typeof target === 'object') {
      const type = target.type || (!('embed' in target) ? Component : HostComponent)
      const opt = Object.assign({}, target, { box, eventBus, context })
      if (('logger' in options) && !('logger' in opt)) opt.logger = options.logger

      if (options.logger) options.logger.debug(`adding root component ${path}`)
      const component = new type(opt)
      if (('embed' in target) && !(component instanceof HostComponent)) throw new Error('llama.host.component.must.be.type.HostComponent')

      router.on(path, component)

      if ('embed' in target) {
        const subRoute = recBuildEmbedded(path, target.embed, opt)
        component.setSubRoute(subRoute)
        for (const p of flattenSubRoute(subRoute)) {
          router.on(p, component)
        }
      }
    } else {
      const opt = { box, eventBus, context }
      if (('logger' in options) && !('logger' in opt)) opt.logger = options.logger
      if (options.logger) options.logger.debug(`adding root component ${path}`)
      const component = new target(opt)
      router.on(path, component)
    }
  }

  return router
}

function recBuildEmbedded(path, embed, opt) {
  const res = {}
  for (const [p, t] of Object.entries(embed)) {

    if (opt.logger) opt.logger.debug(`adding sub component ${path} + ${p}`)
    const box = t.box || opt.sub_box || 'sub'
      , eventBus = opt.eventBus
      , context = opt.context
      , logger = opt.logger || undefined
    if (typeof t === 'object') {
      const type = t.type || (!('embed' in t) ? Component : HostComponent)
        , component = new type(Object.assign({}, t, { box, eventBus, context, logger }))

      if ('embed' in t) {
        if (!(component instanceof HostComponent)) throw new Error('llama.host.component.must.be.type.HostComponent')
        const subRoute = recBuildEmbedded(path + p, t.embed, opt)
        component.setSubRoute(subRoute)
      }

      res[path + p] = component
    } else {
      res[path + p] = new t(Object.assign({}, t, { box, eventBus, context, logger }))
    }

  }
  return res
}

function flattenSubRoute(subRoute, res = []) {
  for (const [p, t] of Object.entries(subRoute)) {
    if (!(t instanceof HostComponent)) {
      res.push(p)
    } else {
      flattenSubRoute(t.getSubRoute(), res)
    }
  }
  return res
}