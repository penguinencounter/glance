import api from './api'
import pageManip from './pageManip'

/// <reference path="../node_modules/jquery/dist/jquery.js" />
/// <reference path="../node_modules/oojs/dist/oojs.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui-wikimediaui.js" />

console.info('Welcome to Glance!')

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

  this.content = new OO.ui.PanelLayout({
    padded: true,
    expanded: false
  })

  this.$body.append(this.content.$element)
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
  return this.content.$element.outerHeight(true)
}

const winMgr = new OO.ui.WindowManager()
$(document.body).append(winMgr.$element)

const glanceOptions = new GlanceOptions({
  size: 'large'
})

winMgr.addWindows([glanceOptions])

// ready?
$(() => {
  // create sidebar
  const sidebarItem = document.createElement('li')
  const sidebarLink = document.createElement('a')
  sidebarLink.innerHTML = 'Glance options'
  sidebarLink.href = '#'
  sidebarLink.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()
    winMgr.openWindow(glanceOptions)
  })

  sidebarItem.appendChild(sidebarLink)
  sidebarItem.classList.add('mw-list-item')
  document.querySelector('#p-tb .vector-menu-content-list').appendChild(sidebarItem)

  // initialize page manipulation - track type of page for patches
  pageManip.readyHandler()
})
