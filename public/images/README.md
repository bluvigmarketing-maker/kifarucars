# /public/images

Drop general site photography here — hero background, logo, About section
photo, team photos, etc. Anything in this folder is served directly from the
site root, so `public/images/hero.jpg` is referenced in code as `/images/hero.jpg`.

For **fleet vehicle photos** specifically, use `public/vehicles/` instead —
that's what the admin dashboard's "Image URL" field and the seed SQL already
point to (e.g. `/vehicles/land-cruiser.jpg`).

Tips:
- Use `.jpg`/`.webp` for photos, `.svg` for logos/icons.
- Keep filenames lowercase with hyphens (`hero-nairobi.jpg`), no spaces.
- Next.js's `<Image>` component (already used across the site) will optimize
  these automatically — no need to pre-resize.
