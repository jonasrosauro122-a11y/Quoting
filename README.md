# LAVA PL RATER - Standalone Static Version

This revised version is designed to work directly in **GitHub** and **Netlify** without installing npm packages and without running a build command.

## Folder structure

```text
lava-pl-rater-standalone/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── images/
│   ├── lava-logo.png
│   └── favicon.svg
├── data/
│   └── scenarios.json
├── netlify.toml
├── _redirects
├── .nojekyll
├── .gitignore
└── README.md
```

## What changed

- Converted from Next.js/React to a standalone static website.
- Removed npm dependency requirements.
- Added a clean GitHub/Netlify-ready structure.
- Added Auto and Homeowners quote workflows.
- Added Easy, Normal, and Hard scenario buttons.
- Added 7 carriers: Travelers, Safeco, Progressive, Mercury, Bamboo, Erie, and National General.
- Added local quote history using browser `localStorage`.
- Added Trainer/TL mode with local monitoring dashboard.
- Added CSV export.
- Added Print / Save PDF support through the browser print dialog.
- Added dark/light mode toggle.

## Trainer access

Default trainer password:

```text
LavaTrainer2025!
```

You can change it in:

```text
js/app.js
```

Find:

```js
const TRAINER_PASSWORD = "LavaTrainer2025!";
```

## How to upload to GitHub

1. Create a new GitHub repository.
2. Upload the contents of this folder to the root of the repository.
3. Make sure `index.html` is in the root, not inside another nested folder.
4. Commit the files.

## How to deploy to Netlify

1. Go to Netlify.
2. Add new site from Git.
3. Select your GitHub repository.
4. Build command: leave it blank.
5. Publish directory: `.`
6. Deploy.

Netlify will also read `netlify.toml`, which is already configured for this static website.

## Important note

This is a training simulator. Premiums are simulated and are not actual carrier-approved rates.
