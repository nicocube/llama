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

  on(t, e, f) {
    const l = (e instanceof Array) ? e : [e]
    l.forEach((k) => {
      let s = this._.get(k)
      if (!s) {
        s = {}
        this._.set(k, s)
      }
      s[t] = f
    })
  }

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

  clear(t) {
    for (const s of this._.values()) {
      if (t in s) delete s[t]
    }
  }
}

export class Events {
  static ROUTER_GO = 'router-go'

  static GET_CARTOGRAPHY_LIST = 'get-cartography-list'
  static SHOW_CARTOGRAPHY_LIST = 'show-cartography-list'

  static POST_NEW_CARTO = 'post-new-carto'
  static GET_CARTOGRAPHY_BY_ID = 'get-cartography-by-id'
  static SHOW_CARTOGRAPHY_BY_ID = 'show-cartography-by-id'

  static POST_CARTOGRAPHY_BY_ID_ISLANDS = 'post-cartography-by-id-islands'

  static CARTO_SELECT_ISLAND_MENU = 'carto-select-island-menu'
  static CARTO_UNSELECT_ISLAND = 'carto-unselect-island'

  static SET_TOOL_SIZE = 'set-tool-size'
  static SET_TOOL_TERRAIN = 'set-tool-terrain'

  static MOVE_POSITION = 'move-position'
  static ZOOM_VIEW = 'zoom-view'
  static ZOOM_BOUND = 'zoom-bound'

  static PRESS = 'press'
  static DRAG = 'drag'
  static RELEASE = 'release'
  static CANCEL = 'cancel'


  static GET_ISLAND_LIST = 'get-island-list'
  static SHOW_ISLAND_LIST = 'show-island-list'

  static POST_NEW_ISLAND = 'post-new-island'
  static GET_ISLAND_BY_ID = 'get-island-by-id'
  static SHOW_ISLAND_BY_ID = 'show-island-by-id'

  static POST_ISLAND_BY_ID_CELLS = 'post-island-by-id-cells'
  static SAVED_ISLAND_MAP = 'saved-island-map'

  static AUTO_SAVE = 'auto-save'

}