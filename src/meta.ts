import shared from "./shared";

export default {
    ready: function () {
        // set up a MutationObserver to detect when the page changes
        const observer = new MutationObserver(function (mutations) {
            const meta = shared.getMetadata()
            if (meta.has("glanceAllowMeta")) {
                ;(document.querySelectorAll(".glance-hide-installed") as NodeListOf<HTMLElement>).forEach( e => {
                    e.style.display = "none";
                })
            }
        })
        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    }
}