
enum WikipathType {
    MIXED_USER_LISTING,
    SINGLE_USER_LISTING,
    DIFF,
}
const wikipathTypeMatchers: {[key in WikipathType]: ((loc: URL) => boolean)[]} = {
    [WikipathType.MIXED_USER_LISTING]: [
        (loc: URL) => loc.searchParams.get("action") === "history",
        (loc: URL) => !!loc.pathname.match(/Special:RecentChanges$/),
        (loc: URL) => !!loc.pathname.match(/Special:Watchlist$/),
        (loc: URL) => !!loc.pathname.match(/Special:Log$/)
    ],
    [WikipathType.SINGLE_USER_LISTING]: [
        (loc: URL) => !!loc.pathname.match(/Special:Contributions\/.*$/)
    ],
    [WikipathType.DIFF]: [
        (loc: URL) => loc.searchParams.has("diff")
    ]

}

function determineCurrentPageType(): WikipathType | null {
    const loc = new URL(location.href);
    for (const [type, matchers] of Object.entries(wikipathTypeMatchers)) {
        if (matchers.some(matcher => matcher(loc))) {
            return +type as WikipathType;
        }
    }
    return null;
}

function readyHandler() {
    const pageType = determineCurrentPageType();
    console.debug("detect page type was " + (pageType === null ? "(none)" : WikipathType[pageType])) // TODO: delete!
    if (pageType === WikipathType.MIXED_USER_LISTING) {

    }
}

// if you remove this, webpack blows up
export default {
    readyHandler: readyHandler
};
