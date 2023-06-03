/// <reference path="../node_modules/jquery/dist/jquery.js" />
/// <reference path="../node_modules/oojs/dist/oojs.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui.js" />
/// <reference path="../node_modules/oojs-ui/dist/oojs-ui-wikimediaui.js" />

export default {
    displayErrorPopup: function(message: string): void {
        OO.ui.alert(message, { title: 'Glance error', size: 'medium' })
    }
}