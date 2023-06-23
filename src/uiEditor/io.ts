import {} from './structure'

// Save/Load manager for the UI editor
type dataVersion = 1
const dataVersion = 1

class IncompatibleSaveError extends Error {
  constructor(version: number) {
    super(`This loader version (${dataVersion}) can't convert save data from version ${version}!`)
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
