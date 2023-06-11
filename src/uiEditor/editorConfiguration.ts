type OptionalTranformer<T> = {
  [prop in keyof T as string]?: T[prop]
}

let currentConfiguration = {
  translucentBackground: false,
  toolboxPinned: false,
}

function loadStoredConfig(allowReloads?: boolean) {
  allowReloads = allowReloads === undefined ? true : allowReloads;
  const config = localStorage.getItem("glance-ui-editor-config") || "{}"
  try {
    type MutableConfiguration = OptionalTranformer<typeof currentConfiguration>
    const storedConfiguration = JSON.parse(config) as MutableConfiguration

    // Update currentConfiguration
    for (const key of Object.keys(storedConfiguration)) {
      type possibleKeys = keyof typeof currentConfiguration
      let value = storedConfiguration[key]
      // Yes, this is a real thing that can happen. Value === undefined is not the same as the key not existing.
      if (value === undefined) continue;
      currentConfiguration[key as possibleKeys] = value
    }
  } catch (e) {
    if (allowReloads) {
      OO.ui.confirm("Failed to load configuration from browser storage. Would you like to reset it?", {size: "large"}).then(confirmed => {
        if (confirmed) {
          localStorage.removeItem("glance-ui-editor-config")
          loadStoredConfig(false)
        }
      })
    } else {
      OO.ui.alert("Failed to load configuration from browser storage. Try refreshing the page.", {size: "large"})
    }
    return;
  }
}

function saveConfig() {
  localStorage.setItem("glance-ui-editor-config", JSON.stringify(currentConfiguration))
}

export default {
  loadStoredConfig,
  saveConfig,
  c: currentConfiguration,
}
