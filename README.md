# Riversong Cabin website

The website for Riversong, a timber-frame cabin on the Ohio River in Leavenworth, Indiana. It is served at https://cabinriversong.com.

It is plain HTML, CSS and JavaScript, with no build step and no frameworks.

> **This is the `redesign` branch.** The live site is still built from `main`. Nothing on this branch is public until it is merged into `main` (see "Make it live" below).

## Pages

| Page | File |
|---|---|
| Home: hero, rooms, outdoors, kitchen, photo gallery | `index.html` |
| About & driving directions | `about.html` |
| Availability calendar (from Google Calendar) | `calendar.html` |
| Rates & policies | `rates.html` |
| Activities nearby | `activities.html` |
| Moods of the Ohio River (photo gallery) | `moods.html` |

## Files

- `css/styles.css`: all the styles. Colors and fonts are set at the top in `:root`.
- `js/site.js`: the mobile menu, the header over the hero, fade-in on scroll, and the photo lightbox (click a photo, then use ← → and Esc, or swipe on a phone).
- `js/calendar.js`: draws the availability calendar from `data/booked.json`. If that file can't be loaded, it shows the original Google Calendar embed instead.
- `data/booked.json`, `scripts/update_calendar.py`, `.github/workflows/update-calendar.yml`: every hour, a GitHub Action reads Darlene's public Google Calendar, saves only the booked dates (never event titles or guest names) to `data/booked.json`, and commits it if anything changed. That commit makes GitHub Pages republish the site.
- `assets/img/`: web-ready photos in WebP format. Each one has a full-size version (up to 2000px, used in the lightbox) and an `-sm` version (up to 900px, used on the page). Photos were rotated upright and their camera and GPS data were removed.
- `Images/` and `background.jpg`: the original photos, kept as the source copies. The pages don't load them.
- `favicon.ico`, `assets/favicon.svg`, `assets/icons/`, `site.webmanifest`: browser and phone icons.
- `CNAME`: the custom domain for GitHub Pages (`cabinriversong.com`). Don't delete it.

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Common edits

- **Phone or email:** they appear in each page's header, contact section and footer. Search all the `.html` files for `314-4007` or `dvasser46` and replace them.
- **Rates:** edit the table and the booking card in `rates.html`. The home page also mentions `$215`.
- **Calendar:** keep adding bookings to the Riversong Google Calendar as before. Any all-day event counts as booked: an event from the 12th to the 14th marks the nights of the 12th, 13th and 14th. The website picks up changes within about an hour. To update it right away, open the repo's **Actions** tab → **Update booked dates** → **Run workflow**.
- **Add a photo:** convert it to WebP (for example `cwebp -q 78 -metadata none photo.jpg -o assets/img/name.webp`, plus a smaller `name-sm.webp`). Then copy one of the `<button data-lightbox=...>` lines in the gallery.

## Cache busting

Pages load `css/styles.css?v=2`, `js/site.js?v=2` and `js/calendar.js?v=2`. After you change the CSS or JS, bump that number in every `.html` file so visitors' browsers fetch the new copy.

## Make it live

GitHub Pages serves the site from the `main` branch. To publish this redesign:

1. Open a pull request from `redesign` into `main` on GitHub and look over the changes.
2. Merge it. GitHub Pages rebuilds automatically within a minute or two.
3. Check https://cabinriversong.com, and do a hard refresh if you still see the old site.
4. GitHub only runs scheduled Actions from `main`, so the hourly calendar update starts after the merge. Run **Update booked dates** once from the Actions tab to check that it works.

To undo, revert the merge commit on `main`.
