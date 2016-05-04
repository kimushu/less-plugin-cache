var isUrlRe = /^(?:https?:)?\/\//i,
    url = require("url"),
    crypto = require("crypto"),
    path = require("path"),
    fs = require("fs"),
    PromiseConstructor;

module.exports = function(less) {
  var CachedFileManager = function(options) {
    this.options = options || {};
  };

  CachedFileManager.prototype = new less.UrlFileManager();

  CachedFileManager.prototype.supports = function(filename, currentDirectory, options, environment) {
    return isUrlRe.test(filename) || isUrlRe.test(currentDirectory);
  };

  CachedFileManager.prototype.loadFile = function(filename, currentDirectory, options, environment) {
    if (!PromiseConstructor) {
      PromiseConstructor = typeof Promise === "undefined" ? require("promise") : Promise;
    }

    var urlStr = isUrlRe.test(filename) ? filename : url.resolve(currentDirectory, filename),
        urlObj = url.parse(urlStr);

    if (!urlObj.protocol) {
      urlObj.protocol = "http";
      urlStr = urlObj.format();
    }

    var md5 = crypto.createHash("md5").update(urlStr, "utf-8").digest("hex");
    var cache_dir = this.options.cache_dir;
    var verbose = this.options.verbose;
    var cache_path = path.join(cache_dir, md5);
    var message = "CachedFileManager: " + cache_path + " <= " + urlStr;
    var _this = this;

    return new PromiseConstructor(function(fulfill, reject) {
      fs.readFile(cache_path, function(err, data) {
        if (!err) {
          if (verbose) {
            process.stderr.write(message + " (exists)\n");
          }
          fulfill({ contents: data, filename: urlStr });
        } else {
          less.UrlFileManager.prototype.loadFile.call(_this, urlStr, null, options, environment).then(function(result) {
            if (!fs.existsSync(cache_dir)) {
              fs.mkdirSync(cache_dir);
            }
            fs.writeFileSync(cache_path, result.contents);
            if (verbose) {
              process.stderr.write(message + " (new)\n");
            }
            return result;
          }).catch(reject);
        }
      });
    });
  };

  return CachedFileManager;
};
// vim: set et sts=2 sw=2:
