const ORIGIN = 'amiable-beetle-emergency-sinlaku.cluster-se1-us.nexlayer.ai';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = ORIGIN;

    const headers = new Headers(request.headers);
    headers.set('Host', ORIGIN);

    return fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'follow',
    });
  },
};
