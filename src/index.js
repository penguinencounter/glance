// import api from './api'
// import uiEditor from './uiEditor/uiEditor'
import pageManip from './pageManip'
import metaFunctions from './meta'
import components from './components'

/// <reference path="../node_modules/jquery/dist/jquery.js" />
/// <reference path="../node_modules/oojs/dist/oojs.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui-wikimediaui.js" />

export default function() {
  components.init()
  console.info('Welcome to Glance!')

  const winMgr = new OO.ui.WindowManager()
  $(document.body).append(winMgr.$element)

  winMgr.addWindows([components.getGlanceOptions()])

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
      winMgr.openWindow(components.getGlanceOptions())
    })

    sidebarItem.appendChild(sidebarLink)
    sidebarItem.classList.add('mw-list-item')
    document.querySelector('#p-tb .vector-menu-content-list')?.appendChild(sidebarItem)

    // initialize page manipulation - track type of page for patches
    pageManip.ready()
    metaFunctions.ready()
  })
}
