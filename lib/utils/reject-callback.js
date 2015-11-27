module.exports = function(callback, err, message) {
  if (callback) {
    setTimeout(function() {
      callback(new Error(message));
    });
  } else {
    return Promise.reject(err);
  }
};
