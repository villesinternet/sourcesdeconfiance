# Extension Sources de confiance

Marque les résultats sur une page de moteur de recherche (SERP) pour visualiser les liens qui correspondent au référentiel « Sources de confiance » proposé par Villes Internet : 35000 sites publics nationaux et locaux, institutionnels et universitaires. Site officiel : sources-de-confiance.fr

### Navigateurs compatibles (v1.0.7 et ultérieures)

- Firefox : https://addons.mozilla.org/fr/firefox/addon/sources-de-confiance/
- Chrome : https://chrome.google.com/webstore/detail/sources-de-confiance/kcogbonnkheeologjkpkclphajgomnjf?hl=fr
- Edge (chromium based) : https://microsoftedge.microsoft.com/addons/detail/kepjhbgmhepmedlmehknjieanmonjjfi

### Moteurs de recherches compatibles (v1.0.7 et ultérieures)

- google.com, google.fr
- qwant.com
- bing.com

## Instructions

### `npm install`

Install dependencies from fresh download/clone

### `npm run build`

Build the extension into `dist` folder for **production**.

### `npm run build:dev`

Build the extension into `dist` folder for **development**.

### `npm run watch`

Watch for modifications then run `npm run build`.

### `npm run watch:dev`

Watch for modifications then run `npm run build:dev`.

It also enable [Hot Module Reloading](https://webpack.js.org/concepts/hot-module-replacement), thanks to [webpack-extension-reloader](https://github.com/rubenspgcavalcante/webpack-extension-reloader) plugin.

:warning: Keep in mind that HMR only works for your **background** entry.

### `npm run build-zip`

Build a zip file following this format `<name>-v<version>.zip`, by reading `name` and `version` from `manifest.json` file.
Zip file is located in `dist-zip` folder.
