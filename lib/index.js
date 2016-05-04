var getCachedFileManager = require("./cached-file-manager");

function LessPluginCachedFileManager() {
}

LessPluginCachedFileManager.prototype = {
  install: function(less, pluginManager) {
    var CachedFileManager = getCachedFileManager(less);
    pluginManager.addFileManager(new CachedFileManager(this.options));
  },
  printUsage: function() {
  },
  setOptions: function(options) {
    args = options.split(" ");
    options = {
      cache_dir: ".cache",
      verbose: false
    };
    args = args.filter(function(arg) {
      var match = arg.match(/^--?([a-z][a-z0-9]*)(?:=(.*))?$/i);
      if (match) {
        arg = match[1];
      } else {
        return arg;
      }
      switch (arg) {
        case "c":
        case "cache-dir":
          options.cache_dir = match[2];
          break;
        case "v":
        case "verbose":
          options.verbose = true;
          break;
        default:
          throw new Error("unrecognised cached-file-manager option '" + arg + "'");
      }
    });
    this.options = options;
  },
  minVersion: [2, 1, 0]
};

module.exports = LessPluginCachedFileManager;
// vim: set et sts=2 sw=2:
