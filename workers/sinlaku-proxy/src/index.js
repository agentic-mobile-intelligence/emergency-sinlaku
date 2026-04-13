const ORIGINS = {
  'sinlaku.directory.gu': 'amiable-beetle-emergency-sinlaku.cluster-se1-us.nexlayer.ai',
  'test-sinlaku.directory.gu': 'amiable-beetle-emergency-sinlaku-dev.cluster-se1-us.nexlayer.ai',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = ORIGINS[url.hostname];
    if (!origin) return new Response('Not found', { status: 404 });

    url.hostname = origin;
    url.protocol = 'https:';

    const headers = new Headers(request.headers);
    headers.set('Host', origin);

    return fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'follow',
    });
  },
};
