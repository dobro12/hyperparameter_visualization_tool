const proxy = require("http-proxy-middleware");

const TIMEOUT = 30*60*1000;
module.exports = function(app) {
  app.use(proxy("/api", {
    target: "http://localhost:4000",
    proxyTimeout: TIMEOUT,
    timeout: TIMEOUT,
  }));
};
