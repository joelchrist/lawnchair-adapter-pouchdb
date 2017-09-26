Lawnchair.adapter('pouchdb', (function () {

  return {
    valid: valid,
    init: init,
    keys: keys,
    save: save,
    batch: batch,
    get: get,
    exists: exists,
    all: all,
    remove: remove,
    nuke: nuke
  };

  function valid() {
    return window.PouchDB !== undefined;
  }

  function init(options, callback) {
    var dbName = options.db || this.name;
    this.db = new PouchDB(dbName);
  }

  function keys(callback) {
    var that = this;
    var success = function (data) {
      if (callback) {
        that.lambda(callback).call(that, data);
      }
    };
    this.db.allDocs({include_docs: true}).then(function (result) {
      var items = result.rows.map(function (item) {
        return item.doc;
      }).sort(function (a, b) {
        return a.key - b.key;
      }).map(function (item) {
        return item._id;
      });
      success(items);
    });
    return this;
  }

  function save(obj, callback) {
    var that = this;
    var success = function (data) {
      if (callback) {
        that.lambda(callback).call(that, data);
      }
    };
    obj._id = obj.key;
    this.get(obj.key, function (doc) {
      obj._rev = doc._rev;
      that.db.put(obj).then(success);
    }, function () {
      that.db.put(obj).then(success);
    });
    return this;
  }

  function batch(objs, callback) {
    var that = this;
    var success = function (result) {
      if (callback) {
        that.lambda(callback).call(that, result);
      }
    };
    objs.forEach(function (item) {
      item._id = item.key;
    });
    this.db.bulkDocs(objs).then(success).catch(success);
    return this;
  }

  function get(keyOrArray, callback, errorCallback) {
    var that = this;
    var success = function (result) {
      if (callback) {
        that.lambda(callback).call(that, result);
      }
    };
    if (this.isArray(keyOrArray)) {
      var result = [];
      keyOrArray.forEach(function (key) {
        this.get(key, function (doc, index) {
          result.push(doc);
          if (index === keyOrArray.length -1) {
            success(result);
          }
        })
      });
    } else {
      this.db.get(keyOrArray).then(success).catch(errorCallback);
    }
    return this;
  }

  function exists(key, callback) {
    var that = this;
    var respond = function (result) {
      if (callback) {
        that.lambda(callback).call(that, result);
      }
    };
    this.get(key, function (doc) {
      respond(true);
    }, function () {
      respond(false);
    });
    return this;
  }

  function all(callback) {
    var that = this;
    var success = function (data) {
      if (callback) {
        that.lambda(callback).call(that, data);
      }
    };
    this.db.allDocs({include_docs: true}).then(function (result) {
      var items = result.rows.map(function (item) {
        return item.doc;
      }).sort(function (a, b) {
        return a.key - b.key;
      });
      success(items);
    });
    return this;
  }

  function remove(keyOrObj, callback) {
    var that = this;
    var key = typeof keyOrObj === 'string' ? keyOrObj : (Array.isArray(keyOrObj) ? null : keyOrObj.key);
    var success = function () {
      if (callback) {
        that.lambda(callback).call(that, null);
      }
    };
    this.get(key, function (doc) {
      this.db.remove(doc).then(success);
    });
    return this;
  }

  function nuke(callback) {
    var that = this;
    var success = function (result) {
      if (callback) {
        that.lambda(callback).call(that, result);
      }
    };
    this.db.destroy().then(success);
    return this;
  }
})());
