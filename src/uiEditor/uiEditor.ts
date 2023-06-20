import shared from "../shared";
import editorConfiguration from "./editorConfiguration"
import STYLESHEET from "./uiEditor.r.css"
import SOURCE from "./uiEditor.r.html"

// Warning: flex layout `align-items` (cross axis) doesn't support `space-between` or `space-around`. Ever. `align-content` doesn't do what you think it does.
// However, `justify-content` (main axis) does support `space-between` and `space-around`.
// Make sure to do the validation stuffs!!

const getCssVar = shared.cache(function (name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
});
const refreshGetCssVar = getCssVar.refresh;

function timeToMillis(value: string): number {
  if (value.endsWith("ms")) return parseFloat(value)
  if (value.endsWith("s")) return parseFloat(value) * 1000
  throw new Error(`Invalid CSS time unit: ${value}`)
}

function injectStylesheet(content: string) {
  const style = document.createElement("style")
  style.textContent = content
  document.head.appendChild(style)
}

const CLOSE_ANIM_VAR = "--glance-close-anim-time"
const OPEN_ANIM_VAR = "--glance-open-anim-time"

let uiEditor: UIEditor | null = null

type UIEditorEventPatch = {
  consumed?: true
}

/**
 * This class represents a single UI editor instance.
 * The same instance is re-used for all UI editor invocations.
 */
class UIEditor {
  private main: HTMLDivElement
  private locked: boolean = false

  private static initDOM(): HTMLDivElement {
    injectStylesheet(STYLESHEET)
    const TRACKED_PROPERTIES = [
      CLOSE_ANIM_VAR,
      OPEN_ANIM_VAR,
    ]
    TRACKED_PROPERTIES.forEach(refreshGetCssVar)
    const main = document.createElement("div")
    main.id = "glance-ui-editor"
    main.innerHTML = SOURCE
    main.tabIndex = -1
    document.body.appendChild(main)

    return main
  }

  private assertUnlocked(): void {
    if (this.locked) throw new Error("UIEditor is locked");
  }

  private updateTranslucentBackground(): void {
    const translucentButton = this.main.querySelector("#glance-ui-editor-toggle-translucency")
    if (editorConfiguration.c.translucentBackground) {
      translucentButton?.classList.add("glance-toggled")
      this.main.classList.add("glance-ui-editor-translucent")
    } else {
      translucentButton?.classList.remove("glance-toggled")
      this.main.classList.remove("glance-ui-editor-translucent")
    }
  }

  private updateToolboxPinned(): void {
    const toolbox = this.main.querySelector("#glance-ui-editor-toolbox")
    const pinToolboxButton = this.main.querySelector("#glance-ui-editor-pin-toolbox")
    if (editorConfiguration.c.toolboxPinned) {
      toolbox?.classList.add("glance--pinned")
      pinToolboxButton?.classList.add("glance-toggled")
    } else {
      toolbox?.classList.remove("glance--pinned")
      pinToolboxButton?.classList.remove("glance-toggled")
    }
  }

  private closePopupMenus(): void {
    this.main.querySelectorAll(".glance-popup-menu.glance-popup-open").forEach((e) => {
      e.classList.remove("glance-popup-open")
    })
  }

  private constructor() {
    // Loading: DOM init
    const existing = document.getElementById("glance-ui-editor") as HTMLDivElement
    if (existing) {
      throw new Error("UIEditor already initialized, cannot create new instance")
    } else {
      this.main = UIEditor.initDOM()
    }
    this.main.addEventListener("keydown", this.overflowKeyDownHandler.bind(this))
    this.main.addEventListener("click", (e: MouseEvent & UIEditorEventPatch) => {
      if (e.consumed) return;
      this.closePopupMenus();
    });

    // Loading: Restore persistent data
    editorConfiguration.loadStoredConfig()
    this.updateTranslucentBackground();
    this.updateToolboxPinned();

    // Loading: Event handlers
    const translucentButton = this.main.querySelector("#glance-ui-editor-toggle-translucency")
    translucentButton?.addEventListener("click", () => {
      editorConfiguration.c.translucentBackground = !editorConfiguration.c.translucentBackground
      this.updateTranslucentBackground();
      editorConfiguration.saveConfig()
    })

    const pinToolboxButton = this.main.querySelector("#glance-ui-editor-pin-toolbox")
    pinToolboxButton?.addEventListener("click", () => {
      editorConfiguration.c.toolboxPinned = !editorConfiguration.c.toolboxPinned
      this.updateToolboxPinned();
      editorConfiguration.saveConfig()
    });

    this.main.querySelectorAll(".glance-button .glance-popup-menu").forEach((_e) => {
      _e.addEventListener("click", (event: Event & UIEditorEventPatch) => {
        // const event = _event as MouseEvent & UIEditorEventPatch
        if (event.consumed) {
          return; // do not process
        }
        // Prevent click events from bubbling up to the parent.
        // The parent is *technically* the button that opens the menu.
        // To avoid side effects of clicking on the menu, we stop the event from propagating.
        event.preventDefault();
        event.consumed = true;
      })
    })

    this.main.querySelectorAll(".glance-button.glance-opens-popup-menu").forEach((_e) => {
      const e = _e as HTMLElement;
      const target = e.dataset.dropdownTarget;
      if (target === undefined) return;
      const popup = this.main.querySelector(`#${target}`);
      if (popup === null) return;
      e.addEventListener("click", _event => {
        const event = _event as MouseEvent & UIEditorEventPatch;
        if (event.consumed) {
          return; // do not process
        }
        this.closePopupMenus(); // close all other menus. only one can be open at a time.
        popup.classList.toggle("glance-popup-open");
        event.preventDefault();
        event.consumed = true;
      });
    })
  }

  public static get(): UIEditor {
    // yes this is a singleton. deal with it.
    if (uiEditor) return uiEditor
    return uiEditor = new UIEditor()
  }

  private overflowKeyDownHandler(e: KeyboardEvent & UIEditorEventPatch): void {
    console.info("keydown", e)
    if (e.consumed) {
      return; // do not process
    }

    if (this.locked) return; // ignore keypresses while locked
    let handled: boolean = false
    if (e.key === "Escape") {
      this.close(false);
      handled = true
    }

    // pretend this is the root of the document, and deny events to any other elements
    e.preventDefault()
    e.stopPropagation()
  }

  public syncImmediateOpen(): void {
    // Cancel opening animation if it's not open - prevent conflict
    if (!this.main.classList.contains("glance-ui-editor-open")) return;
    this.main.classList.remove("glance-ui-editor-closing", "glance-ui-editor-opening")
    document.body.classList.add("glance-no-scroll")
    this.main.focus();
    this.locked = false
  }

  public async open(instant?: boolean): Promise<void> {
    instant = instant || false;
    if (instant) {
      this.main.classList.add("glance-ui-editor-open");
      this.syncImmediateOpen()
    } else {
      this.locked = false
      this.main.classList.add("glance-ui-editor-open", "glance-ui-editor-opening");
      this.main.classList.remove("glance-ui-editor-closing")
      await shared.sleep(timeToMillis(getCssVar(OPEN_ANIM_VAR)))
      this.syncImmediateOpen()
    }
  }

  public syncImmediateClose(): void {
    // Cancel closing animation if it's open - prevent conflict
    if (this.main.classList.contains("glance-ui-editor-open")) return;
    this.main.classList.remove("glance-ui-editor-closing", "glance-ui-editor-opening", "glance-ui-editor-open")
    document.body.classList.remove("glance-no-scroll")
    this.locked = true

    // reset DOM elements that could persist across editor invocations
    // don't break the editor by leaving it in a weird state
    this.main.querySelectorAll(".glance-popup-menu").forEach((e) => {
      e.classList.remove("glance-popup-open")
    })
  }

  public async close(instant?: boolean): Promise<void> {
    instant = instant || false;
    this.assertUnlocked()
    if (instant) {
      this.main.classList.remove("glance-ui-editor-open");
      this.syncImmediateClose()
    } else {
      this.locked = true
      this.main.classList.add("glance-ui-editor-closing");
      this.main.classList.remove("glance-ui-editor-open", "glance-ui-editor-opening")
      await shared.sleep(timeToMillis(getCssVar(CLOSE_ANIM_VAR)))
      this.syncImmediateClose()
    }
  }
}

export type UIEditorType = UIEditor

export default {
  UIEditor: UIEditor,
  styles: STYLESHEET
}