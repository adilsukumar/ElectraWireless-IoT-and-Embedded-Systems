import server from '../dist/server/server.js';

export default async function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach(v => headers.append(key, v));
    } else {
      headers.set(key, value);
    }
  }
  
  const method = req.method;
  let body = undefined;
  
  if (method !== 'GET' && method !== 'HEAD') {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    body = Buffer.concat(buffers);
  }

  const webRequest = new Request(url, {
    method,
    headers,
    body,
    duplex: body ? 'half' : undefined
  });

  try {
    const webResponse = await server.fetch(webRequest, process.env, {});
    
    res.statusCode = webResponse.status;
    res.statusMessage = webResponse.statusText;
    
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    if (webResponse.body) {
      // TanStack Start response body might be a stream
      const reader = webResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch(e) {
    console.error(e);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
