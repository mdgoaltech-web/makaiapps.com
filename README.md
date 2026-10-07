# makaiapps.com — MAK AI Apps website

A fast static website: plain HTML, CSS and JavaScript, with no build step and no framework. Upload the folder to any static host and it works.

```
index.html          Home page (all sections)
privacy.html        Privacy Policy (covers the website and your published apps)
terms.html          Terms of Use
404.html            Not-found page
robots.txt, sitemap.xml, site.webmanifest
_headers            Security/cache headers for Netlify or Cloudflare Pages
vercel.json         The same headers for Vercel
assets/css/styles.css
assets/js/main.js
assets/img/         Logo, favicons, app icons, social share image
```

## Before going live — checklist

1. **Contact form delivery.** In `index.html`, find `data-endpoint=""` on the `<form>` and paste a form-backend URL
   (for example a free [Formspree](https://formspree.io) form: `https://formspree.io/f/xxxxxx`).
   Until you do, the form still works: it validates and then opens the visitor's email app with the message filled in, addressed to `afex@makaiapps.com`.
2. **Email.** Every address on the site is `afex@makaiapps.com`. Make sure that mailbox exists.
3. **Statistics.** The stats band only shows facts that are true from day one. To add real numbers (apps published, downloads, countries), copy the example in the HTML comment above the `.stats-grid`. They animate automatically.
4. **Privacy Policy.** This is a solid general policy for a studio that uses AdMob, Firebase and store billing. Ask a lawyer to review it for your jurisdiction, and add any SDKs your apps use that aren't listed.

## Deploying to makaiapps.com

Any static host works. Two easy options:

- **Cloudflare Pages / Netlify:** create a project, upload this folder (or connect a Git repo with this folder as the root, no build command, output directory `/`), then add `makaiapps.com` and `www.makaiapps.com` as custom domains and follow the DNS records the host shows.
- **Vercel:** `vercel deploy` from this folder, then add the domain in Project → Settings → Domains.

Turn on HTTPS (all three do it automatically) and redirect `www` to the bare domain, since the canonical URLs use `https://makaiapps.com/`.

## Previewing locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. Links use root paths like `/assets/...`, so open the site through a server rather than double-clicking the file.

## Editing the design

All colours, radii and fonts are CSS variables at the top of `assets/css/styles.css`. The accent colour is `--volt`.
