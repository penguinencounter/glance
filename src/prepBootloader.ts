import run from './index.js'
import rawRequirements from './mw-modules.json'

declare global {
  var mw: {
    loader: {
      using: (requirements: string[], ready?: () => any, error?: () => any) => JQueryPromise<void>
    }
  }
}

const requirements = JSON.parse(rawRequirements) as string[]

mw.loader.using(requirements).then(() => {
  run()
})
