# ScoreTracker

[![CI](https://github.com/cloutidj/score-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/cloutidj/score-tracker/actions/workflows/ci.yml)

[Application](https://cloutidj.github.io/score-tracker/)

A score-tracking PWA built with Angular 22 and Clarity 18 (standalone components,
signals, zoneless change detection).

## Development

```sh
npm install
npm start          # ng serve at http://localhost:4200
npm run lint
npm run build      # production build to dist/score-tracker/browser
npm run serve:pwa  # production build + static server (exercises the service worker)
```

CI (lint + build) runs on every pull request; pushes to `master` build and deploy
to GitHub Pages via `.github/workflows/ci.yml`.

## Credits

<div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/"             title="Flaticon">www.flaticon.com</a></div>
