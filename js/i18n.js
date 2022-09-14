import LOCALES_FR from "./locales/fr.js"
import LOCALES_EN from "./locales/en.js"

export const locale = (window.location.host == "openyoureyes.app") ? "en" : "fr"

export const Translations = locale == "en" ? LOCALES_EN : LOCALES_FR

export function Text(path, options = {}) {
    return path.split('.').reduce((translations, path) => translations[path], Translations).replace(/{{(.*?)}}/g, (_, group) => options[group])
}
