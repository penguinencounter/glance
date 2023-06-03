import shared from "./shared";

/// <reference path="../node_modules/jquery/dist/jquery.js" />
/// <reference path="../node_modules/oojs/dist/oojs.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui-wikimediaui.js" />

/** @param {{uiBuilderContent: HTMLElement}} config */
function GlanceLargeContainer(config) {
    GlanceLargeContainer.super.apply(this, config)
    this.$element.addClass('glance-large-container')
    this.uiBuilderContent = config.uiBuilderContent
}
OO.inheritClass(GlanceLargeContainer, OO.ui.PanelLayout)
GlanceLargeContainer.static.name = 'glanceLargeContainer'

GlanceLargeContainer.prototype.initialize = function () {
    GlanceLargeContainer.super.prototype.initialize.apply(this, arguments)
    this.$element.append(this.uiBuilderContent)
}

/** @param {HTMLElement} content */
function largeContainer(content) {
    return new GlanceLargeContainer({
        uiBuilderContent: content
    }).$element
}

export default {
    largeContainer: largeContainer
}