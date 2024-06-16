const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8082/api',
      // target: 'http://localhost:9100/',
      changeOrigin: true,
      logger: console,
      pathRewrite:{
        [`^/api/`]:`/`
      }
    })
  );
};