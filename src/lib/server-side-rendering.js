require("../run-through-babel");

var express = require("express");
var logger = require("./logger");
var logsColorScheme = require("./logsColorScheme");
var filename = logsColorScheme.filename;

var WebpackIsomorphicTools = require("webpack-isomorphic-tools");
var projectBasePath = process.cwd();

var isProduction = process.env.NODE_ENV === "production";

var PORT = process.env.PORT || (isProduction ? 8888 : 8880);
const HOST = "0.0.0.0";

(function () {
  global.webpackIsomorphicTools = new WebpackIsomorphicTools(require("./webpack-isomorphic-tools-configuration"))
  .development(process.NODE_ENV !== "production")
  .server(process.cwd(), function () {
    var app = express();
    var serverRequestHandler = require("../lib/server-request-handler");
    const address = "http://" + HOST + ":" + PORT;

    if (isProduction) {
      app.use("/assets", express.static("build"));
      logger.success(`Server side rendering server running at ${filename(address)}`);
    }
    else {
      app.get("/gluestick-proxy-poll", function(req, res) {
        // allow requests from our client side loading page
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.status(200).json({up: true});
      });
      logger.success(`Server side rendering proxy running at ${filename(address)}`);
    }

    app.use(serverRequestHandler);
    app.listen(PORT, HOST);
  });
})();
