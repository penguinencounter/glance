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
  this.mainLayout = new OO.ui.FieldsetLayout({
    label: 'Action listings',
  })
  this.debugLaunchUiEditor = new OO.ui.ButtonWidget({
    label: 'Edit appearance in UI editor',
    icon: 'tag',
    flags: ['progressive']
  })
  this.debugLaunchUiEditor.on('click', () => {
    uiEditor.UIEditor.get().open();
    this.close();
  })
  this.mainLayout.addItems([
    new OO.ui.FieldLayout(this.debugLaunchUiEditor)
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

const glanceOptions = new GlanceOptions({
  size: 'large'
})

export default {
  largeContainer: largeContainer,
  glanceOptions: glanceOptions
}