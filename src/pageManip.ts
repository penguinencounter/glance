
type WikipathType = (
    "versionListing"
    | "diff"
    | "userContributions"
)
const wikipathTypeMatchers: {[key in WikipathType]?: ((loc: URL) => boolean)[]} = {
    versionListing: [
        (loc: URL) => loc.searchParams.get("action") === "history",
        (loc: URL) => !!loc.pathname.match(/Special:RecentChanges$/),
        (loc: URL) => !!loc.pathname.match(/Special:Watchlist$/)
    ],
    userContributions: [
        (loc: URL) => !!loc.pathname.match(/Special:Contributions\/.*$/)
    ]
}

function determineCurrentPageType(): WikipathType | null {
    const loc = new URL(location.href);
    for (const [type, matchers] of Object.entries(wikipathTypeMatchers)) {
        if (matchers.some(matcher => matcher(loc))) {
            return type as WikipathType;
        }
    }
    return null;
}

function readyHandler() {
    const pageType = determineCurrentPageType();
    console.debug("detect page type was " + (pageType === null ? "(none)" : pageType)) // TODO: delete!
    if (pageType === "versionListing") {

    }
}

// if you remove this, webpack blows up
export default {
    readyHandler: readyHandler
};
