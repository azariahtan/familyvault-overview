export default {
  async fetch(request, env, ctx) {
    return new Response('Worker is alive! Your Cloudflare Worker is working correctly.', { 
      status: 200,
      headers: { 'content-type': 'text/plain' }
    });
  }
}
