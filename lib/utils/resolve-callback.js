module.exports = function(ids, callback, results) {
  if (callback) {
    setTimeout(function() {
      callback(null, results && results.length === 1 ? results[0] : results);
    });
  }

  return Array.isArray(ids) ? results : results[0];
};
