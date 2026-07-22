const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy /relay requests to the relayer service
  app.use(
    '/relay',
    createProxyMiddleware({
      target: 'http://localhost:8549',
      changeOrigin: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Relay proxy error:', err);
        res.status(500).json({ error: 'Relayer proxy error', message: err.message });
      }
    })
  );

  // Proxy /ipfs requests to IPFS gateway
  app.use(
    '/ipfs',
    createProxyMiddleware({
      target: 'http://localhost:8090',
      changeOrigin: true
    })
  );
};
