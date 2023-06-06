import { default as uiEditor, UIEditorType } from "./uiEditor/uiEditor"

/// <reference path="../node_modules/jquery/dist/jquery.js" />
/// <reference path="../node_modules/oojs/dist/oojs.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui-wikimediaui.js" />

interface Metadata {
  has: (key: string) => boolean,
  get: (key: string) => string,
  data: { [key: string]: string }
}

interface MetadataPartial {
  has?: (key: string) => boolean,
  get?: (key: string) => string,
  data: { [key: string]: string }
}
let activeUiEditor: UIEditorType | null = null;

export default {
  displayErrorPopup: function (message: string): void {
    OO.ui.alert(message, { title: 'Glance error', size: 'medium' })
  },
  cache: function <TR, TA extends any[]>(wrap: (...args: TA) => TR):
    ((...args: TA) => TR) & { clear: () => void, refresh: (...args: TA) => TR } {
    let cache: { [key: string]: TR } = {}
    const f = (...args: TA): TR => {
      const key = JSON.stringify(args)
      if (cache[key] === undefined) cache[key] = wrap(...args)
      return cache[key]
    }
    f.clear = () => cache = {}
    f.refresh = (...args: TA): TR => {
      const key = JSON.stringify(args)
      cache[key] = wrap(...args)
      return cache[key]
    }
    return f;
  },
  getMetadata: function (): Metadata {
    const metaTag: HTMLElement | null = document.getElementById('glance-meta') as HTMLElement
    let resultPartial: MetadataPartial = { data: {} }
    resultPartial.has = (key: string) => resultPartial.data[key] !== undefined
    resultPartial.get = (key: string) => resultPartial.data[key]
    let result: Metadata = resultPartial as Metadata

    if (metaTag === null) {
      return result
    }
    const configs = metaTag.dataset
    for (let [key, value] of Object.entries(configs)) {
      if (value === undefined) continue;
      result.data[key] = value;
    }
    return result;
  },
  sleep: function (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}