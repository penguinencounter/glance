import shared from "./shared";

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



const glanceOptions = new GlanceOptions({
  size: 'large'
})

export default {
  largeContainer: largeContainer,

}