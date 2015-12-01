module.exports = function(callback, err, message) {
  console.log('got error');
  console.log(err);
  if (callback) {
    setTimeout(function() {
      callback(new Error(message));
    });
  } else {
    return Promise.reject(err);
  }
};
