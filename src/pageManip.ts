import shared from './shared'

enum WikipathType {
  MIXED_USER_LISTING,
  SINGLE_USER_LISTING,
  DIFF,
}
const wikipathTypeMatchers: { [key in WikipathType]: Array<(loc: URL) => boolean> } = {
  [WikipathType.MIXED_USER_LISTING]: [
    (loc: URL) => loc.searchParams.get('action') === 'history',
    (loc: URL) => /Special:RecentChanges$/.test(loc.pathname),
    (loc: URL) => /Special:Watchlist$/.test(loc.pathname),
    (loc: URL) => /Special:Log$/.test(loc.pathname)
  ],
  [WikipathType.SINGLE_USER_LISTING]: [
    (loc: URL) => /Special:Contributions\/.*$/.test(loc.pathname)
  ],
  [WikipathType.DIFF]: [
    (loc: URL) => loc.searchParams.has('diff')
  ]

}

function determineCurrentPageType(): WikipathType | null {
  const loc = new URL(location.href)
  for (const [type, matchers] of Object.entries(wikipathTypeMatchers)) {
    if (matchers.some(matcher => matcher(loc))) {
      return +type as WikipathType
    }
  }
  return null
}

function makeSingleUserListing(): void {
  const glanceContainer = document.createElement('div')
  glanceContainer.innerHTML = '[glance container]'
  const targetLocation = document.querySelector('#mw-content-text')
  if (targetLocation === null) {
    shared.displayErrorPopup('Could not find a suitable target location to insert Glance info.')
    return;
  }
  document.querySelector('#mw-content-text')?.prepend(glanceContainer)
}

function readyHandler(): void {
  const pageType = determineCurrentPageType()
  console.debug('detect page type was ' + (pageType === null ? '(none)' : WikipathType[pageType])) // TODO: delete!
  switch (pageType) {
    case WikipathType.MIXED_USER_LISTING:
      // not implemented
      break
    case WikipathType.SINGLE_USER_LISTING:
      makeSingleUserListing()
      break
  }
}

// if you remove this, webpack blows up
export default {
  readyHandler
}
