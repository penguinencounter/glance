import { WikipathType } from "./pagemods/structures";
import shared from "./shared";
import uiEditor from "./uiEditor/uiEditor";

/// <reference path="../node_modules/jquery/dist/jquery.js" />
/// <reference path="../node_modules/oojs/dist/oojs.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui-wikimediaui.js" />

/** @param {HTMLElement} content */
function largeContainer(content) {
  return new OO.ui.PanelLayout({
    $content: $(content),
    padded: true,
    framed: true,
    scrollable: false,
    expanded: false,
    classes: ["glance-large-container"],
  }).$element
}
let glanceOptions = null

function initGlanceOptions() {
  function GlanceOptions(config) {
    GlanceOptions.super.apply(this, config)
  }
  OO.inheritClass(GlanceOptions, OO.ui.ProcessDialog)
  GlanceOptions.static.name = 'glanceOptions'
  GlanceOptions.static.title = 'Glance options'
  GlanceOptions.static.actions = [
    {
      action: 'save',
      label: 'Save',
      flags: ['primary', 'progressive']
    },
    {
      label: 'Discard',
      flags: 'safe'
    }
  ]
  
  GlanceOptions.prototype.initialize = function () {
    GlanceOptions.super.prototype.initialize.apply(this, arguments)
  
    this.mainLayout = new OO.ui.FieldsetLayout()
    if (window.liveLoaderRefreshCache) {
      let refreshCacheBtn = new OO.ui.ButtonWidget({
        label: 'Check for updates!',
        icon: 'clock',
      })
      refreshCacheBtn.on('click', () => {
        window.liveLoaderRefreshCache()
      });
      let tempFS = new OO.ui.FieldsetLayout({
        label: 'LiveLoader integration'
      })
      tempFS.addItems([refreshCacheBtn])
      this.mainLayout.addItems([tempFS])
    }
    this.meters = new OO.ui.FieldsetLayout({
      label: 'Meter styles',
    })
    this.contribs = new OO.ui.FieldsetLayout({
      label: 'Single-user listings (contributions)',
    })
    let editContribsBtn = new OO.ui.ButtonWidget({
      label: 'Launch UI editor',
      icon: 'arrowNext',
      flags: ['progressive']
    })
    editContribsBtn.on('click', () => {
      uiEditor.UIEditor.get().open(WikipathType.SINGLE_USER_LISTING);
      this.close();
    })
    this.contribs.addItems([
      new OO.ui.FieldLayout(editContribsBtn)
    ])
  
    this.mainLayout.addItems([
      this.meters,
      this.contribs
    ])
  
    this.windowContainer = new OO.ui.PanelLayout({
      $content: this.mainLayout.$element,
      padded: true,
      expanded: false
    })
  
    this.$body.append(this.windowContainer.$element)
  }
  
  GlanceOptions.prototype.getActionProcess = function (action) {
    const dialog = this
    if (action) {
      return new OO.ui.Process(() => {
        dialog.close({ action })
      })
    }
    return GlanceOptions.super.prototype.getActionProcess.call(this, action)
  }
  
  GlanceOptions.prototype.getBodyHeight = function () {
    return this.windowContainer.$element.outerHeight(true)
  }
  
  glanceOptions = new GlanceOptions({
    size: 'large'
  })
}

export default {
  largeContainer: largeContainer,
  init: initGlanceOptions,
  getGlanceOptions: () => glanceOptions
}