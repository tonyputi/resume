const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character])

export function renderMetadata({ name, label, summary, url, profiles = [] }) {
  const canonical = new URL(url)
  if (canonical.protocol !== 'https:') throw new Error('The CV canonical URL must use HTTPS')
  const title = `${name} — ${label}`
  const [intro] = new Intl.Segmenter('en', { granularity: 'sentence' }).segment(summary)
  const description = intro.segment.trim()
  const image = new URL('assets/social-preview.png', canonical).href
  const imageAlt = `${name} — Curriculum vitae`
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${canonical}#profile`,
    url: canonical.href,
    name: title,
    description,
    mainEntity: {
      '@type': 'Person',
      '@id': `${canonical}#person`,
      name,
      url: canonical.href,
      jobTitle: label,
      description: summary,
      sameAs: profiles.map(profile => profile.url),
    },
  }

  return `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="author" content="${escapeHtml(name)}">
<link rel="canonical" href="${escapeHtml(canonical.href)}">
<link rel="icon" type="image/png" sizes="96x96" href="assets/favicon.png">
<link rel="icon" type="image/svg+xml" sizes="any" href="assets/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<meta property="og:type" content="profile">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical.href)}">
<meta property="og:site_name" content="${escapeHtml(name)} — CV">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">
<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>
`
}
