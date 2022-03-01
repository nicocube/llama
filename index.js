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

import Component, { ContextComponent } from './component.js'
import EventBus from './event-bus.js'
import Router from './router.js'

export {
  Component, EventBus, Router, ContextComponent
}

export default class AppView {
  /**
   * Initialize AppView
   *
   * @param {HTMLDivElement} appBox the div we load components in
   * @param {EventBus} eventBus to receive and send events to receive and send events
   */
  constructor(appBox, eventBus) {
    this.appBox = appBox
    // FIXME action in a constructor
    if (!this.appBox.shadowRoot) this.appBox.attachShadow({ mode: 'open' })
    this.eventBus = eventBus
    this.component = undefined
  }

  /**
   * Clean the app box and load new component inside
   *
   * @param {Component} component
   */
  load(component) {
    const { shadowRoot } = this.appBox
    if (component.hasContent()) {
      this.clear()
      component.injectCSS(shadowRoot)
      component.injectHTML(shadowRoot)
    }
    component.setBox(shadowRoot)
    component.init()
    this.component = component
  }

  /**
   * Clear the app box
   */
  clear() {
    const { shadowRoot } = this.appBox
    while (shadowRoot.hasChildNodes()) {
      shadowRoot.removeChild(shadowRoot.firstChild)
    }
    this.component?.clean()
  }
}