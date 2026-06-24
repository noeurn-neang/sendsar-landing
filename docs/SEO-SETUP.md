# Sendsar SEO Setup Guide

Step-by-step checklist for **sendsar.com** (marketing landing site).

**Stack:** Next.js 16 App Router · Sanity CMS (blog) · Domain: `https://sendsar.com`

---

## What is already built in this repo

Most on-page SEO is already implemented. You mainly need to configure the domain, deploy, and register with search engines.

| Area | File(s) | Status |
|------|---------|--------|
| Site config (name, URL, keywords) | `src/lib/site.ts` | Done |
| Metadata helper (title, OG, Twitter, canonical) | `src/lib/seo.ts` | Done |
| Root layout metadata | `src/app/layout.tsx` | Done |
| Per-page metadata | `src/app/page.tsx`, `pricing/page.tsx`, `blog/*` | Done |
| `robots.txt` | `src/app/robots.ts` → `/robots.txt` | Done |
| `sitemap.xml` | `src/app/sitemap.ts` → `/sitemap.xml` | Done |
| Open Graph image | `src/app/opengraph-image.tsx` → `/opengraph-image` | Done |
| Web app manifest | `src/app/manifest.ts` | Done |
| JSON-LD (home, articles) | `src/components/seo/*` | Done |
| Google Search Console verification file | `public/google68224d0be829c463.html` | Done |
| Favicons | `public/favicon.svg`, `public/apple-touch-icon.png`, etc. | Done |

Related property (separate repo): **docs.sendsar.com** has its own SEO in `sendsar-monorepo/apps/docs/.vitepress/seo.ts`. Set it up separately in Search Console.

---

## Step 1 — Pick your canonical domain

Choose one primary URL and stick to it everywhere:

- **Recommended:** `https://sendsar.com` (no `www`)
- Redirect the other variant permanently (301):
  - `https://www.sendsar.com` → `https://sendsar.com`

The codebase defaults to `https://sendsar.com` in `src/lib/site.ts`. All canonical URLs and sitemap entries are built from that value.

---

## Step 2 — DNS and hosting

### 2.1 Point DNS to your host

At your registrar (Cloudflare, Namecheap, etc.), add records for the landing app:

| Record | Type | Value | Notes |
|--------|------|-------|-------|
| `@` (root) | `A` or `CNAME` | Your host IP / target | e.g. Vercel, Netlify, or VPS |
| `www` | `CNAME` | Same host or redirect rule | Redirect to apex |

**If using Vercel:** add `sendsar.com` and `www.sendsar.com` in Project → Settings → Domains. Vercel issues SSL automatically.

**If using a VPS (Caddy/Nginx):** terminate TLS and proxy to the Next.js app (`next start` on port 3000 or a Docker container).

### 2.2 Enable HTTPS

Search engines expect HTTPS. Confirm:

```bash
curl -I https://sendsar.com
```

You should see `HTTP/2 200` (or `301` only if redirecting `www` → apex).

---

## Step 3 — Production environment variables

Create `.env.production` (or set vars in your hosting dashboard). These control canonical URLs in metadata and sitemap:

```bash
# Required for correct canonical URLs, OG links, and sitemap
NEXT_PUBLIC_SITE_URL=https://sendsar.com

# Cross-links (already have sensible defaults)
NEXT_PUBLIC_DOCS_URL=https://docs.sendsar.com
NEXT_PUBLIC_DEMO_URL=https://demo.sendsar.com
```

**Important:** If `NEXT_PUBLIC_SITE_URL` is missing in production, the app still defaults to `https://sendsar.com`, but always set it explicitly on staging/preview so preview URLs are not indexed with wrong canonicals.

For preview/staging deployments, either:

- Set `NEXT_PUBLIC_SITE_URL` to the preview URL **and** block indexing (see Step 10), or
- Use password protection / `noindex` on non-production hosts.

---

## Step 4 — Build and deploy

```bash
cd sendsar-landing
pnpm install   # or npm install
pnpm build
pnpm start     # production server
```

After deploy, verify these URLs return **200** and correct content:

| URL | Purpose |
|-----|---------|
| `https://sendsar.com/` | Homepage |
| `https://sendsar.com/robots.txt` | Crawler rules |
| `https://sendsar.com/sitemap.xml` | URL list for Google |
| `https://sendsar.com/opengraph-image` | Default social preview image |
| `https://sendsar.com/manifest.webmanifest` | PWA manifest |
| `https://sendsar.com/blog` | Blog index |
| `https://sendsar.com/google68224d0be829c463.html` | Google verification |

Quick smoke test:

```bash
curl -sS https://sendsar.com/robots.txt
curl -sS https://sendsar.com/sitemap.xml | head
```

Expected `robots.txt`:

```
User-Agent: *
Allow: /

Sitemap: https://sendsar.com/sitemap.xml
```

---

## Step 5 — Google Search Console

### 5.1 Add the property

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add property → **URL prefix**: `https://sendsar.com`
3. Verify ownership.

### 5.2 Verify via HTML file (already in repo)

The verification file is committed at:

```
public/google68224d0be829c463.html
```

After deploy, Google fetches:

`https://sendsar.com/google68224d0be829c463.html`

Choose **HTML file** verification method in Search Console and confirm.

### 5.3 Submit sitemap

In Search Console → **Sitemaps** → add:

```
https://sendsar.com/sitemap.xml
```

The sitemap includes:

- `/` (homepage)
- `https://docs.sendsar.com` and quickstart (external docs URLs)
- `/blog` and each published Sanity post
- `/pricing` only when `siteMode.showPricing` is `true` in `src/lib/nav.ts`

### 5.4 Request indexing (optional, for launch)

URL Inspection → enter `https://sendsar.com/` → **Request indexing**.

Repeat for `/blog` and key posts after publishing.

---

## Step 6 — Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add site `https://sendsar.com`.
3. Import from Google Search Console (fastest) or verify separately.
4. Submit sitemap: `https://sendsar.com/sitemap.xml`.

---

## Step 7 — Validate metadata and social previews

### 7.1 View page source

On the homepage, confirm in `<head>`:

- `<title>`
- `<meta name="description">`
- `<link rel="canonical" href="https://sendsar.com/">`
- `og:title`, `og:description`, `og:image`
- `twitter:card` = `summary_large_image`

Metadata is generated by `createMetadata()` in `src/lib/seo.ts`.

### 7.2 Test share previews

| Tool | URL |
|------|-----|
| Facebook / Meta | https://developers.facebook.com/tools/debug/ |
| LinkedIn | https://www.linkedin.com/post-inspector/ |
| Twitter/X | https://cards-dev.twitter.com/validator |
| Open Graph generic | https://www.opengraph.xyz/ |

Test URLs:

- `https://sendsar.com/`
- `https://sendsar.com/blog/<slug>`

Blog posts use the Sanity hero image for OG when available; otherwise the default `/opengraph-image`.

### 7.3 Rich results / structured data

Test with [Google Rich Results Test](https://search.google.com/test/rich-results):

- Homepage → `Organization`, `WebSite`, `SoftwareApplication` (from `HomeJsonLd`)
- Blog post → `Article`, `BreadcrumbList` (from `ArticleJsonLd`)

---

## Step 8 — Blog SEO (Sanity CMS)

Posts are loaded from Sanity (`src/sanity/client.ts`, dataset `production`).

For each blog post in Sanity Studio, fill SEO fields when available:

| Field | Purpose |
|-------|---------|
| **Meta title** | Overrides default post title in Google results |
| **Meta description** | Snippet text (aim for ~150–160 characters) |
| **Keywords** | Extra keywords for the page |
| **Hero image** | Used as OG/Twitter image |
| **Published date** | Used in sitemap `lastModified` and article schema |

Code path: `src/app/blog/[slug]/page.tsx` → `generateMetadata()` reads `post.seo.*`.

**Publishing checklist per post:**

1. Unique, descriptive title (not duplicated across posts).
2. Meta description that matches the content.
3. At least one in-content H2 for structure.
4. Internal links to docs (`docs.sendsar.com`) where relevant.
5. Publish → confirm URL appears in `/sitemap.xml` within the next build/deploy.

---

## Step 9 — Content and site-wide SEO habits

### 9.1 One H1 per page

The landing sections and blog templates should keep a single clear H1. Blog posts use `PostHeader` for the title.

### 9.2 Internal linking

- Footer and nav already link to `/blog`, docs, and contact.
- Add contextual links inside blog posts to product sections and docs.

### 9.2 Keywords (already configured)

Default keywords live in `src/lib/site.ts`. Update there for site-wide changes; override per page via `createMetadata({ keywords: [...] })`.

### 9.3 When you enable pricing

In `src/lib/nav.ts`, set:

```ts
showPricing: true,
```

Then redeploy. `/pricing` will appear in nav, sitemap, and should be submitted for indexing.

---

## Step 10 — Staging / preview: avoid duplicate indexing

Non-production hosts must not compete with `sendsar.com` in Google.

**Options (pick one per environment):**

1. **HTTP auth** or private network (best).
2. **`robots.txt` disallow** on staging (host-level).
3. Add `noIndex: true` in metadata for staging builds via an env flag (requires a small code change if not already present).

Never point staging DNS to a public URL without `noindex` or auth.

---

## Step 11 — Performance (Core Web Vitals)

SEO ranking is influenced by page experience.

After launch, check:

- [PageSpeed Insights](https://pagespeed.web.dev/) → `https://sendsar.com`
- Search Console → **Experience** → Core Web Vitals

This Next.js app already uses `next/font` for font optimization. Keep hero images compressed; Sanity images go through `@sanity/image-url`.

---

## Step 12 — Analytics (optional but recommended)

Search Console shows queries and clicks, not on-site behavior. Add one analytics tool:

| Option | Notes |
|--------|-------|
| [Plausible](https://plausible.io) | Privacy-friendly, lightweight |
| [Google Analytics 4](https://analytics.google.com) | Free, integrates with Search Console |
| [Vercel Analytics](https://vercel.com/docs/analytics) | If hosted on Vercel |

Wire via `next/script` in `src/app/layout.tsx` when you choose a provider.

---

## Step 13 — Post-launch monitoring (ongoing)

### Weekly (first month)

- [ ] Search Console → **Pages** → fix crawl errors
- [ ] Search Console → **Sitemaps** → confirm “Success”
- [ ] Publish blog post → confirm it appears in sitemap

### Monthly

- [ ] Review top queries in Search Console → **Performance**
- [ ] Update meta descriptions on underperforming pages
- [ ] Refresh OG image if branding changes (`src/app/opengraph-image.tsx`)
- [ ] Re-test rich results after schema changes

### When changing domain or URL structure

1. Update `NEXT_PUBLIC_SITE_URL` and `src/lib/site.ts`.
2. Set up 301 redirects for old paths.
3. Resubmit sitemap in Search Console.
4. Use **Change of address** in Search Console if the domain itself changes.

---

## Quick reference — key files to edit

| Goal | Edit |
|------|------|
| Site name, description, keywords, default URL | `src/lib/site.ts` |
| Title/OG/Twitter/canonical for a page | Page’s `export const metadata` or `generateMetadata` |
| Sitemap entries | `src/app/sitemap.ts` |
| Crawler rules | `src/app/robots.ts` |
| Default social image | `src/app/opengraph-image.tsx` |
| Homepage structured data | `src/components/seo/HomeJsonLd.tsx` |
| Show/hide pricing in sitemap & nav | `src/lib/nav.ts` → `siteMode.showPricing` |
| Google verification file | `public/google68224d0be829c463.html` |

---

## Launch day checklist (copy/paste)

```
[ ] DNS: sendsar.com → production host
[ ] DNS: www → 301 redirect to apex (or vice versa, but be consistent)
[ ] HTTPS works on sendsar.com
[ ] NEXT_PUBLIC_SITE_URL=https://sendsar.com set in production
[ ] Deploy latest build
[ ] /robots.txt returns Allow + Sitemap URL
[ ] /sitemap.xml lists homepage, blog, docs links
[ ] /google68224d0be829c463.html accessible
[ ] Google Search Console: property verified
[ ] Google Search Console: sitemap submitted
[ ] Bing Webmaster Tools: sitemap submitted
[ ] OG preview looks correct for / and one blog post
[ ] Rich Results Test passes for homepage
[ ] Staging/preview is not indexable
```

---

## Related properties

Set up Search Console **separately** for each:

| Property | Sitemap |
|----------|---------|
| `https://sendsar.com` | `https://sendsar.com/sitemap.xml` |
| `https://docs.sendsar.com` | `https://docs.sendsar.com/sitemap.xml` |

Cross-linking is already configured: docs reference `SENDSAR_SITE_URL`, and the marketing sitemap includes docs URLs.
