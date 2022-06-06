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

export default class EventBus {
  constructor(options = {}) {
    this._ = new Map()
    this.excludeFromLog = ('excludeFromLog' in options) ? options.excludeFromLog : []
  }

  /**
   * Attach an event listener for a source
   * @param {string} n name of the source of the listener
   * @param {string|string[]} e the event(s) key(s) to attach the listener
   * @param {(...r) => {}} f the listener function
   */
  on(n, e, f) {
    const l = (e instanceof Array) ? e : [e]
    l.forEach((k) => {
      let s = this._.get(k)
      if (!s) {
        s = {}
        this._.set(k, s)
      }
      s[n] = f
    })
  }

  /**
   * Emit an event for a given key that are sent to every attached events listeners
   * @param {string} k the event key
   * @param  {...any} p the optional params
   */
  emit(k, ...p) {
    if (!this.excludeFromLog.includes(k)) console.log(k, ...p)
    setTimeout(() => {
      const s = this._.get(k)
      if (s) {
        Object.values(s).forEach(f => {
          f(...p)
        })
      }
    }, 1)
  }

  /**
   * Clear event listeners for a source
   * @param {string} n the name of the source to clear events for
   */
  clear(n) {
    for (const s of this._.values()) {
      if (n in s) delete s[n]
    }
  }
}
