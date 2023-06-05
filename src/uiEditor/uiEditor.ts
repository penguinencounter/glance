import STYLESHEET from "./uiEditor.r.css"
import SOURCE from "./uiEditor.r.html"

function injectStylesheet(content: string) {
  const style = document.createElement("style");
  style.textContent = content;
  document.head.appendChild(style);
}


class UIEditor {
  private main: HTMLDivElement;

  private static initDOM(): HTMLDivElement {
    injectStylesheet(STYLESHEET);
    const main = document.createElement("div");
    main.id = "glance-ui-editor";
    main.innerHTML = SOURCE;
    document.body.appendChild(main);
    return main;
  }

  constructor() {
    // re-use existing DOM if it exists
    this.main = document.getElementById("glance-ui-editor") as HTMLDivElement || UIEditor.initDOM();
  }
}

export default {
  UIEditor: UIEditor,
  styles: STYLESHEET
}