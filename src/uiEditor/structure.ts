import { Type } from "../../node_modules/typescript/lib/typescript";
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

interface AbstractElement {
  // HTML visual attributes
  id: string,
  display: "block" | "flex" | "grid" | "inline",
  children: (AbstractElement)[],

  // Editor attributes
  locked: EditorLock,
  /** Never save this element, and discard it if it has any siblings */
  ephemeral: boolean,
  /** Insert a placeholder (ephemeral) element
   * if this element is empty in the Editor */
  autoPlaceholder: boolean,
}

interface BlockElement extends AbstractElement {
  display: "block" | "flex" | "grid",
  children: (InlineElement | BlockElement)[],
  hOverflow: BlockOverflow,
  vOverflow: BlockOverflow,
  hLayout: BlockLayout,
  vLayout: BlockLayout,
}
interface InlineElement extends AbstractElement {
  display: "inline",
  children: InlineElement[],
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

interface FlexContainer extends BlockElement {
  display: "flex",
  direction: FlexDirection,
  reverse: boolean,
  wrap: FlexWrap,
  hJustify: FlexJustify,
  vJustify: FlexJustify
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
}

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

function makePlaceholder(): InlineElement {
  return {
    autoPlaceholder: false,
    children: [],
    locked: EditorLock.ALL,
    ephemeral: true,
    display: "inline",
    id: nextElId(),
  }
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
  FlexDirection,
  FlexWrap,
  FlexJustify,
  getIcon
}
