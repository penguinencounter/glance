import shared from "../shared";
import STYLESHEET from "./uiEditor.r.css"
import SOURCE from "./uiEditor.r.html"



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

  private constructor() {
    // re-use existing DOM if it exists
    const existing = document.getElementById("glance-ui-editor") as HTMLDivElement
    if (existing) {
      throw new Error("UIEditor already initialized, cannot create new instance")
    } else {
      this.main = UIEditor.initDOM()
    }
    this.main.addEventListener("keydown", this.overflowKeyHandler.bind(this))
  }

  public static get(): UIEditor {
    // yes this is a singleton. deal with it.
    if (uiEditor) return uiEditor
    return uiEditor = new UIEditor()
  }

  private overflowKeyHandler(e: KeyboardEvent): void {
    console.info("keydown", e)
    if (this.locked) return; // ignore keypresses while locked
    let handled: boolean = false
    if (e.key === "Escape") {
      this.close(false);
      handled = true
    }

    if (handled) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  public syncImmediateOpen(): void {
    // Cancel opening animation if it's not open - prevent conflict
    if (!this.main.classList.contains("glance-ui-editor-open")) return;
    this.main.classList.remove("glance-ui-editor-closing", "glance-ui-editor-opening")
    this.locked = false
  }
  
  public async open(instant?: boolean): Promise<void> {
    instant = instant || false;
    this.main.focus();
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
    this.locked = true
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