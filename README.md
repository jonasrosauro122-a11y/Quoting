# LAVA PL RATER - Carrier Portal Standalone

This is a standalone, static Personal Lines rater training simulator. It is designed to work directly in GitHub and Netlify without a build command.

## What is included

- `index.html` - main standalone app
- `css/styles.css` - carrier portal UI styling
- `js/app.js` - workflow, questions, scenarios, rating logic, saved history
- `images/lava-logo.svg` - local logo asset
- `data/scenarios.json` - note file for structure clarity
- `netlify.toml` - Netlify static publish configuration
- `_redirects` - fallback route for Netlify

## Netlify setup

Use these settings:

- Build command: leave blank
- Publish directory: `.`

## GitHub upload rule

Upload the contents of this folder to the root of your GitHub repository. The `index.html` file must be visible at the root level.

Correct:

```text
/index.html
/css/styles.css
/js/app.js
/images/lava-logo.svg
/netlify.toml
/_redirects
```

Wrong:

```text
/lava-pl-rater-carrier-portal/index.html
```

## Features

- Carrier-style dashboard
- New Quote workflow
- Auto and Home quote products
- Precise section-by-section questions
- Easy, Normal, Hard training scenarios
- Carrier appetite board
- Underwriting flags
- Quote comparison results
- Save quote history in browser localStorage
- Export saved quotes to CSV
- Print or Save as PDF through browser print
- Dark and light theme

## Important training note

Premiums and carrier appetite results are simulated for training only. This is not an actual rating engine and should not be used to produce real customer insurance premiums.
