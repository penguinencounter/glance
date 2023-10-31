import iconLibrary from "./iconLibrary";

// UIEditor Structured Data

enum EditorLock {
  NONE = 0,
  PROPERTIES = 1 << 0,
  CHILDREN = 1 << 1,
  ALL = PROPERTIES | CHILDREN,
}

enum Direction {
  HORIZONTAL,
  VERTICAL,
}

enum BlockOverflow {
  AUTO,
  CLIP,
  VISIBLE,
}
enum BlockLayout {
  FILL,
  PUSH,
  SHRINK,
  FIXED
}


let usedIds: string[] = [];
let nextIdIdx = 0;
function id2str(id: number): string {
  // spreadsheet-style ids (a, b, c, ..., y, z, aa, ab, ac, ..., az, ba, bb, ...)
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const alphabetLen = alphabet.length;
  let str = "";
  while (id >= alphabetLen) {
    str += alphabet[id % alphabetLen];
    id = Math.floor(id / alphabetLen) - 1;
  }
  str += alphabet[id];
  str = str.split('').reverse().join('');
  return str;
}
function nextElId(): string {
  while (true) {
    const id = id2str(nextIdIdx++);
    if (!usedIds.includes(id)) {
      usedIds.push(id);
      return id;
    }
  }
}

// exclude more parameters from the type by extending the second parameter to Exclude<>
type ElementConfiguration<T, Not = never> = { [k in keyof T as Exclude<k, ("display" | Not)>]?: T[k] }

abstract class AbstractElement {
  id: string = nextElId();
  readonly abstract display: "block" | "flex" | "grid" | "inline";
  children: AbstractElement[] = [];
  locked: EditorLock = EditorLock.NONE;
  ephemeral: boolean = false;
  autoPlaceholder: boolean = false;

  constructor(configure: ElementConfiguration<AbstractElement>) {
    Object.assign(this, configure);
  }

  abstract baseNode(): Node
  build(replace?: Node): Node {
    let node = this.baseNode()
    if (node instanceof HTMLElement) {
      this.applyProps(node);
    }
    for (const child of this.children) {
      node.appendChild(child.baseNode());
    }
    if (replace) {
      if (replace instanceof HTMLElement) {
        // use the handy API
        replace.replaceWith(node)
      } else {
        // uhhh
        // replaceChild(new, old) (this is backwards. JS is weird)
        if (replace.parentNode) replace.parentNode.replaceChild(node, replace)
        else throw new Error("Can't replace node: parent node is missing for some reason")
      }
    }
    return node
  }
  protected applyProps(assignee: HTMLElement) {
    assignee.dataset.glanceId = this.id;
    assignee.style.display = this.display;
  }
}

class BlockElement extends AbstractElement {
  // mimic a <div>
  readonly display: "block" | "flex" | "grid" = "block"
  children: (InlineElement | BlockElement)[] = []
  hOverflow: BlockOverflow = BlockOverflow.AUTO
  vOverflow: BlockOverflow = BlockOverflow.AUTO
  hLayout: BlockLayout = BlockLayout.FILL
  vLayout: BlockLayout = BlockLayout.SHRINK

  constructor(configure: ElementConfiguration<BlockElement>) {
    super(configure);
    Object.assign(this, configure);
  }

  override baseNode(): Node {
    return document.createElement("div");
  }
  protected override applyProps(assignee: HTMLElement) {
    super.applyProps(assignee)
    assignee.style.overflowX = e2css.overflow(this.hOverflow);
    assignee.style.overflowY = e2css.overflow(this.vOverflow);
  }
}
class InlineElement extends AbstractElement {
  readonly display = "inline"
  children: InlineElement[] = []

  constructor(configure: ElementConfiguration<InlineElement>) {
    super(configure);
    // does this even do anything?
    Object.assign(this, configure);
  }

  override baseNode(): Node {
    return document.createElement("span");
  }
}
class TextElement extends InlineElement {
  readonly children = []
  locked: EditorLock = EditorLock.CHILDREN;
  text: string = ""

  override baseNode(): Node {
    return document.createTextNode(this.text)
  }

  // having children is banned D: (please don't take this out of context)
  constructor(configure: ElementConfiguration<TextElement, "children">) {
    super(configure);
    Object.assign(this, configure);

    // no we are not letting you unlock it
    this.locked |= EditorLock.CHILDREN;
  }
}

enum FlexDirection {
  ROW,
  COLUMN,
}
enum FlexWrap {
  WRAP,
  NOWRAP,
  REVERSE,
}
enum FlexJustify {
  FLEX_START,
  FLEX_END,
  CENTER,
  SPACE_BETWEEN,
  SPACE_AROUND,
}

class FlexContainer extends BlockElement {
  readonly display = "flex"
  direction: FlexDirection = FlexDirection.ROW
  reverse: boolean = false
  wrap: FlexWrap = FlexWrap.NOWRAP
  hJustify: FlexJustify = FlexJustify.FLEX_START
  vJustify: FlexJustify = FlexJustify.FLEX_START

  constructor(configure: ElementConfiguration<FlexContainer>) {
    super(configure);
    Object.assign(this, configure);
  }

  protected override applyProps(assignee: HTMLElement): void {
    super.applyProps(assignee);
    assignee.style.flexDirection = e2css.flexDirection(this.direction, this.reverse);
    assignee.style.flexWrap = e2css.flexWrap(this.wrap);

    switch (this.direction) {
      case FlexDirection.ROW:
        // justify-content goes left-to-right
        // align-items goes top-to-bottom
        if (this.vJustify == FlexJustify.SPACE_AROUND || this.vJustify == FlexJustify.SPACE_BETWEEN) {
          // Illegal option.
          // FIXME: Don't abort building the element and instead use a sensible default and error styling.
          throw new Error("Illegal option: vertical justify cannot be space-around or space-between in a horizontal flex container");
        } else {
          assignee.style.alignItems = e2css.justify(this.vJustify);
        }
        assignee.style.justifyContent = e2css.justify(this.hJustify);
        break
      case FlexDirection.COLUMN:
        // justify-content goes top-to-bottom
        // align-items goes left-to-right
        if (this.hJustify == FlexJustify.SPACE_AROUND || this.hJustify == FlexJustify.SPACE_BETWEEN) {
          // Illegal option.
          throw new Error("Illegal option: horizontal justify cannot be space-around or space-between in a vertical flex container");
        } else {
          assignee.style.alignItems = e2css.justify(this.hJustify);
        }
        assignee.style.justifyContent = e2css.justify(this.vJustify);
    }
  }
}

interface UISet {
  name: string,
  targets: {
    [name: string]: BlockElement | InlineElement,
  }
}

const e2n = {
  direction: (direction: Direction): string => {
    switch (direction) {
      case Direction.HORIZONTAL:
        return "h";
      case Direction.VERTICAL:
        return "v";
    }
  },
  flexDirection: (flexDirection: FlexDirection): string => {
    switch (flexDirection) {
      case FlexDirection.ROW:
        return "row";
      case FlexDirection.COLUMN:
        return "column";
    }
  },
  flexWrap: (flexWrap: FlexWrap): string => {
    switch (flexWrap) {
      case FlexWrap.WRAP:
        return "wrap";
      case FlexWrap.NOWRAP:
        return "nowrap";
      case FlexWrap.REVERSE:
        return "wrap-reverse";
    }
  },
  justify: (justify: FlexJustify): string => {
    switch (justify) {
      case FlexJustify.FLEX_START:
        return "flex-start";
      case FlexJustify.FLEX_END:
        return "flex-end";
      case FlexJustify.CENTER:
        return "center";
      case FlexJustify.SPACE_BETWEEN:
        return "space-between";
      case FlexJustify.SPACE_AROUND:
        return "space-around";
    }
  },
  layout: (layout: BlockLayout): string => {
    switch (layout) {
      case BlockLayout.FILL:
        return "fill"
      case BlockLayout.PUSH:
        return "push"
      case BlockLayout.SHRINK:
        return "shrink"
      case BlockLayout.FIXED:
        return "fixed"
    }
  },
  overflow: (overflow: BlockOverflow): string => {
    switch (overflow) {
      case BlockOverflow.AUTO:
        return "auto";
      case BlockOverflow.CLIP:
        return "clip";
      case BlockOverflow.VISIBLE:
        return "visible";
    }
  }
} as const

const e2css = {
  overflow: (overflow: BlockOverflow): string => {
    switch (overflow) {
      case BlockOverflow.AUTO: return "auto";
      case BlockOverflow.CLIP: return "clip";
      case BlockOverflow.VISIBLE: return "visible";
    }
  },
  flexDirection: (flexDirection: FlexDirection, reverse: boolean): string => {
    const tac = reverse ? "-reverse" : ""
    switch (flexDirection) {
      case FlexDirection.ROW: return "row" + tac
      case FlexDirection.COLUMN: return "column" + tac
    }
  },
  flexWrap: (flexWrap: FlexWrap): string => {
    switch (flexWrap) {
      case FlexWrap.NOWRAP: return "nowrap"
      case FlexWrap.WRAP: return "wrap"
      case FlexWrap.REVERSE: return "wrap-reverse"
    }
  },
  justify: (justify: FlexJustify): string => {
    switch (justify) {
      case FlexJustify.FLEX_START: return "flex-start"
      case FlexJustify.FLEX_END: return "flex-end"
      case FlexJustify.CENTER: return "center"
      case FlexJustify.SPACE_BETWEEN: return "space-between"
      case FlexJustify.SPACE_AROUND: return "space-around"
    }
  }
} as const

function validateAndReturnIcon(propName: string): string {
  if (propName in Object.keys(iconLibrary)) {
    return iconLibrary[propName as keyof typeof iconLibrary];
  }
  throw new Error(`Missing icon: ${propName}`);
}

const getIcon = {
  flexDirection: (flexDirection: FlexDirection, reverse: boolean): string => {
    let propName = `flex-direction_${e2n.flexDirection(flexDirection)}`;
    if (reverse) {
      propName += "-reverse";
    }
    return validateAndReturnIcon(propName);
  },
  flexWrap: (flexWrap: FlexWrap, direction: Direction): string => {
    const propName = `${e2n.direction(direction)}_flex-wrap_${e2n.flexWrap(flexWrap)}`;
    return validateAndReturnIcon(propName);
  },
  justify: (justify: FlexJustify, direction: Direction): string => {
    const propName = `${e2n.direction(direction)}_justify_${e2n.justify(justify)}`;
    return validateAndReturnIcon(propName);
  },
  layout: (layout: BlockLayout, direction: Direction): string => {
    const propName = `${e2n.direction(direction)}_layout_${e2n.layout(layout)}`
    return validateAndReturnIcon(propName);
  },
  overflow: (overflow: BlockOverflow, direction: Direction): string => {
    const propName = `${e2n.direction(direction)}_overflow_${e2n.overflow(overflow)}`;
    return validateAndReturnIcon(propName);
  },
}

function makePlaceholder(): InlineElement {
  return new InlineElement({
    autoPlaceholder: false,
    locked: EditorLock.ALL,
    ephemeral: true,
  })
}

function defaultSingleUser(): AbstractElement {
  return new BlockElement({
    autoPlaceholder: true,
    children: [
      new TextElement({
        text: "Welcome to the Glance UI editor! Drag-and-drop elements into this container to add them to the page."
      })
    ],
    locked: EditorLock.PROPERTIES,
    id: nextElId(),
    ephemeral: false,
    hLayout: BlockLayout.FILL,
    hOverflow: BlockOverflow.AUTO,
    vLayout: BlockLayout.SHRINK,
    vOverflow: BlockOverflow.AUTO,
  })
}

export type {
  EditorLock,
  AbstractElement,
  Direction,
  BlockElement,
  BlockOverflow,
  BlockLayout,
  InlineElement,
  FlexDirection,
  FlexWrap,
  FlexJustify,
  FlexContainer,
  UISet,
};

export default {
  EditorLock,
  Direction,
  BlockOverflow,
  BlockLayout,
  AbstractElement,
  BlockElement,
  InlineElement,
  TextElement,
  FlexDirection,
  FlexWrap,
  FlexJustify,
  FlexContainer,
  makePlaceholder,
  defaultSingleUser,
}
