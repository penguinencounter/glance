import { AbstractElement } from './structure'

// Save/Load manager for the UI editor
type dataVersion = 1
const dataVersion = 1

class IncompatibleSaveError extends Error {
  constructor(version: number) {
    super(`Can't convert UIEditor save data from version ${version}!`)
  }
}

interface HistoricalSave {
  version: number,
  [param: string]: any
}
interface Save {
  version: dataVersion,
}

function upgrade(data: HistoricalSave): Save {
  switch (data.version) {
    case dataVersion:
      return <Save>data
    default:
      throw new IncompatibleSaveError(data.version)
  }
}

// class RecursiveDescentWriter {
//   constructor(root: HTMLElement) {

//   }

//   private translate(html: HTMLElement): AbstractElement {
//     const elementChildren: HTMLElement[] = []
//     html.childNodes.forEach((e) => {
//       if (e instanceof HTMLElement) {
//         elementChildren.push(e)
//       }
//     })
//     return {
//       children: elementChildren.map(this.translate),
//     }
//   }
// }

function saveDOM(root: HTMLElement): Save {
  return {
    version: dataVersion,
  }
}
