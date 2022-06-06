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
    if (!this.appBox.shadowRoot) {
      this.appBox.attachShadow({ mode: 'open' })
      while (this.appBox.hasChildNodes()) {
        this.appBox.shadowRoot.appendChild(this.appBox.firstChild)
      }
    }
    this.eventBus = eventBus
    this.component = undefined
  }

  /**
   * load component inside the app box
   *
   * @param {Component} component
   */
  load(component) {
    const { shadowRoot } = this.appBox

    // fill box with HTML if necessary
    if (component.hasHTML()) {
      this.clear()
      component.injectCSS(shadowRoot)
      component.injectHTML(shadowRoot)
    }

    // clean previous component
    this.component?.clean()

    component.setBox(shadowRoot)
    component.init()
    // set new component as current
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
  }
}