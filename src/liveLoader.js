// Use this file for live loading of the extension from GitHub.
// You'll always have the latest features, but it's very unstable.

// use liveLoaderRefreshCache() in the console to flush the cache and reload the page.

/// <reference path="../node_modules/jquery/dist/jquery.js" />

function mkLiveLoader() {
  targets = [];
  var result = function(target_url) {
    targets.push(target_url);
    return fetch(target_url).then(function(resp) { return resp.text(); }).then(eval);
  }
  result.refreshCache = function() {
    return new Promise(function(resolve, reject) {
      var toComplete = targets.length;
      var success = 0;
      var failure = 0;
      targets.forEach(function(el) {
        fetch(el, {cache: "reload"}).then(function() {
          // resolve
          success++;
          toComplete--;
          if (toComplete === 0) {
            resolve({successCount: success, failureCount: failure, total: success + failure})
          }
        }, function() {
          // reject
          failure++;
          toComplete--;
          if (toComplete === 0) {
            resolve({successCount: success, failureCount: failure, total: success + failure})
          }
        });
      });
    });
  }
  return result;
}

$(function() {
  var liveLoader = mkLiveLoader();
  var latestBuildURL = "https://penguinencounter.github.io/glance/main.js";
  var moduleURL = "https://penguinencounter.github.io/glance/mw-modules.json";
  function init(modules) {
    var s = "[Glance] Using the following MediaWiki modules: ";
    modules.forEach(function(el) { s += el + ", "; });
    s = s.substring(0, s.length - 2);
    console.info(s);
    mw.loader.using(modules).then(function() {
      window.liveLoaderRefreshCache = function() {
        liveLoader.refreshCache().then(function(resp) {
          console.log("Refreshed cache: " + resp.successCount + " success, " + resp.failureCount + " failure");
          OO.ui.confirm("Reloaded userscript cache: " + resp.successCount + " / " + resp.total + " OK. Reload the page?", {size: "medium"}).done(
            function(confirmed) { if (confirmed) document.location.reload(); }
          )
        });
      }

      liveLoader(latestBuildURL); // Load the latest build.
    });

  }
  fetch(moduleURL, {cache: "no-store"}).then(function(resp) { return resp.json(); }).then(function(json) {
    init(json);
  }).catch(function(err) {
    var DEFAULT_MW_LOADER_USES = [
      'oojs-ui-core',
      'oojs-ui-windows',
      'oojs-ui.styles.icons-movement',
      'oojs-ui.styles.icons-interactions'
    ];
    console.error("Failed to load modules.json, using default modules.");
    console.error("Message: ", err);
    init(DEFAULT_MW_LOADER_USES);
  });
});