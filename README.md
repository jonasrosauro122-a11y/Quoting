# LAVA PL RATER - Realistic Carrier Portal Standalone

This is a static Personal Lines carrier-style quote simulator for VA training. It does not need npm, Next.js, React, Supabase, or a build command.

## What is included

- `index.html` - main standalone website
- `css/styles.css` - full carrier-portal UI styling
- `js/app.js` - quote questions, validation, rating simulation, history, CSV export, and print/PDF behavior
- `images/` - logo and favicon assets
- `data/` - notes for static data
- `netlify.toml` and `_redirects` - Netlify-ready static configuration

## Main changes in this upgraded version

- Removed training scenario buttons and replaced them with realistic New Business carrier intake
- Converted the flow into realistic New Business carrier intake
- Added detailed carrier-style questions for Auto and Homeowners
- Added required-field validation per section
- Added quote number, producer setup, policy effective date, billing, risk, coverage, discounts, documents, and underwriting sections
- Maintained quote history, CSV export, print/save PDF, dark mode, carrier appetite, and local browser storage

## Netlify setup

Use these settings:

- Build command: leave blank
- Publish directory: `.`

## GitHub setup

Upload the contents of this folder to your repository root. Your repo root should show:

```text
index.html
css/
js/
images/
data/
netlify.toml
_redirects
README.md
```

Do not upload only the ZIP file to GitHub. Extract it first, then upload the folder contents.

## Notes

All carriers in this simulator are fictional and are used for training only. The rating results are not real insurance quotes.
