import './style.css';

const url = new URL(window.location.href);
const path = url.pathname.replace(/\/+$/, '') || '/';
const isDemo = path === '/demo' || url.searchParams.get('demo') === '1';

type PageDetails = { description: string; title: string; url: string };

const pageDetails: Record<string, PageDetails> = {
  '/': {
    title: 'Flipbook Trace — Turn video into tracing frames',
    description: 'Choose a local video, pick frames, and export numbered PNGs or a printable PDF trace sheet.',
    url: '/',
  },
  '/privacy': {
    title: 'Privacy — Flipbook Trace',
    description: 'How Flipbook Trace handles local video, settings, and licenses.',
    url: '/privacy',
  },
  '/terms': {
    title: 'Terms — Flipbook Trace',
    description: 'Terms for using Flipbook Trace and buying Studio.',
    url: '/terms',
  },
  '/demo': {
    title: 'Demo — Flipbook Trace',
    description: 'Try twelve ready paper-bird tracing frames.',
    url: '/demo',
  },
};

function setPageDetails(details: PageDetails): void {
  document.title = details.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', details.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://flipbook-trace.sociobot.in${details.url}`);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', details.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', details.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', `https://flipbook-trace.sociobot.in${details.url}`);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', details.title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', details.description);
}

setPageDetails(pageDetails[isDemo ? '/demo' : path] || {
  title: 'Page not found — Flipbook Trace',
  description: 'This page does not exist. Open Flipbook Trace.',
  url: path,
});

// A hosted checkout returns here with a license. Save and clean the URL before
// the larger application module loads so the unlock survives even on a slow
// connection and no token remains in browser history.
if (!isDemo) {
  const returnedLicense = url.searchParams.get('license');
  if (returnedLicense) {
    localStorage.setItem('sb_license:flipbook-trace', returnedLicense);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
}

// A direct demo visit is the product's first action. Keep its boot module
// separate from the local-video editor, billing, and persistence runtime so a
// cold phone parses only the sample workflow it needs.
if (isDemo) void import('./demo');
else void import('./app');
