/**
 * return lazy result in right format
 *
 * @param ids
 * @param {Function} callback
 * @param {Array} data in result array
 * @param {Object} [options] allow result as array
 * @returns {*}
 */
module.exports = function(ids, callback, data, options) {
  options = options || {};

  var result;
  if (options.arrayOnly) {
    result = data;
  } else {
    result = Array.isArray(ids) ? data : data && data[0];
  }

  if (callback) {
    setTimeout(function() {
      callback(null, result);
    });
  }

  return result;
};
