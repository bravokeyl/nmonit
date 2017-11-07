function offlineFetch(url, options) {

  if (!url || url === '') return Promise.reject(new Error('Please provide a URL'));
  if (options !== undefined && typeof options !== 'object') return Promise.reject(new Error('If defined, options must be of type object'));
  if (!fetch) return Promise.reject(new Error('fetch not supported, are you missing the window.fetch polyfill?'));

  // offline not requested, execute a regular fetch
  if (!options || !options.offline) return fetch(url, options);

  // get the offline options, if set to true assumes defaults
  var offlineOptions = (typeof options.offline !== 'object') ? {} : options.offline;

  // storage type, default sessionStorage (supports any storage matching localStorage API)
  var storage = window[offlineOptions.storage || 'sessionStorage'];

  // request timeout in milliseconds, defaults to 30 seconds
  var timeout = parseInt(offlineOptions.timeout || '10000', 10);

  // number of retries before giving up
  var retries = parseInt(offlineOptions.retries || '-1', 10);

  // number of milliseconds to wait between each retry
  var retryDelay = parseInt(offlineOptions.retryDelay || '-1', 10);

  // expires in milliseconds, defaults to -1 so checks for new content on each request
  var expires = (typeof offlineOptions.expires === 'number') ? offlineOptions.expires : -1;

  // should this request skip cache?
  var renew = (offlineOptions.renew === true);

  // logs request/cache hits to console if enabled, default false
  var debug = (offlineOptions.debug === true);

  // method, defaults to GET
  var method = options.method || 'GET';

  // detect offline if supported (if true, browser supports the property & client is offline)
  var isOffline = (navigator.onLine === false);

  // a hash of the method + url, used as default cache key if no generator passed
  var requestHash = 'nm:' + stringToHash(method + '|' + url);

  // if cacheKeyGenerator provided, use that otherwise use the hash generated above
  var cacheKey = (typeof options.cacheKeyGenerator === 'function') ? options.cacheKeyGenerator(url, options, requestHash) : requestHash;

  // remove null items from options (EDGE does not like them)
  Object.keys(options || {}).forEach(function(key) {
      if (options[key] === null) {
          delete options[key];
      }
  });

  // execute cache gets with a promise, just incase we're using a promise storage
  return Promise.resolve(storage.getItem(cacheKey)).then(function (cachedItem) {

      // convert to JSON object if it's not already
      cachedItem = (typeof cachedItem === 'string') ? JSON.parse(cachedItem) : cachedItem;

      // convert cached data into a fetch Response object, allowing consumers to process as normal
      var cachedResponse = null;

      if (cachedItem) {
          cachedResponse = new Response(cachedItem.content, {
              status: cachedItem.status,
              statusText: cachedItem.statusText,
              headers: {
                  'Content-Type': cachedItem.contentType
              }
          });
      }

      // determine if the cached content has expired
      var cacheExpired = (cachedItem && expires > 0) ? ((Date.now() - cachedItem.storedAt) > expires) : false;
      if(cachedItem){
        console.warn("Cache expired:",cacheExpired,"Expires in:",((cachedItem.storedAt+expires)-Date.now())/1000," secs");
      }
      // if the request is cached and we're offline, return cached content
      if (cachedResponse && isOffline) {
          if (debug) log('From Fetch Cache (offline): ' + url);
          return Promise.resolve(cachedResponse);
      }

      // if the request is cached, expires is set but not expired, and this is not a renew request, return cached content
      if (cachedResponse && !cacheExpired && !renew) {
          if (debug) log('From Fetch Cache: ' + url);
          return Promise.resolve(cachedResponse);
      }

      // execute the request within a timeout, if it times-out, return cached response
      return promiseTimeout(timeout, fetch(url, options)).then(function (res) {

          // if response status is within 200-299 range inclusive res.ok will be true
          if (res.status >= 200 && res.status <= 299) {

              var contentType = res.headers.get('Content-Type') || '';

              // let's only store in cache if the content-type is JSON or something non-binary
              if (contentType.match(/application\/json/i) || contentType.match(/text\//i)) {
                  // There is a .json() instead of .text() but we're going to store it as a string anyway.
                  // If we don't clone the response, it will be consumed by the time it's returned.
                  // This way we're being un-intrusive.
                  res.clone().text().then(function (content) {

                      var contentToStore = JSON.stringify({
                          status: res.status,         // store the response status
                          statusText: res.statusText, // the response status text
                          contentType: contentType,   // the response content type
                          content: content,           // the body of the response as a string
                          storedAt: Date.now()        // store the date-time in milliseconds that the item was cached
                      });

                      // store the content in cache as a JSON object
                      storage.setItem(cacheKey, contentToStore);
                  });
              }
          }

          if (debug) log('From Fetch Live: ' + url);

          return res;
      })
      .catch(function (error) {

          var errorMessage = error.message || '';
          var timedout = (errorMessage) === 'Promise Timed Out';

          // if its a timeout and we have a cached response, return it
          if (timedout && cachedResponse) {

              if (debug) log('offlineFetch[cache] (timedout): ' + url);

              return Promise.resolve(cachedResponse);
          }

          // if it was not a timeout, but we have retries, try them
          if (!timedout && retries) {

              if (debug) log('offlineFetch[' + errorMessage + '] (retrying): ' + url);

              // retry fetch
              return fetchRetry(url, options, retries, retryDelay, debug);
          }

          // it's a genuine request error, reject as normal
          return Promise.reject(error);
      });
  });
}

function fetchRetry(url, options, retries, retryDelay, debug) {

  retries = retries || 3;
  retryDelay = retryDelay || 1000;

  return new Promise(function (resolve, reject) {

      var wrappedFetch = function (n) {

          if (debug) log('offlineFetch[retrying] (' + n + ' of ' + retries + '): ' + url);

          fetch(url, options).then(function (response) {
              resolve(response);
          })
          .catch(function (error) {

              if (n > 0) {
                  setTimeout(function () {
                      wrappedFetch(--n);
                  }, retryDelay);
              }
              else {
                  reject(error);
              }
          });
      };

      wrappedFetch(retries);
  });
}

function log(value) {
  if (console && console.log) {
      console.log(value);
  }
}

function stringToHash(value) {

  var hash = 0;

  if (value.length === 0) return hash;

  for (var i = 0, l = value.length; i < l; i++) {
      var char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
  }

  return hash;
}

function promiseTimeout(ms, promise) {

  return new Promise(function (resolve, reject) {

      // create a timeout to reject promise if not resolved
      var timer = setTimeout(function () {
          reject(new Error('Promise Timed Out'));
      }, ms);

      promise.then(function (res) {
          clearTimeout(timer);
          resolve(res);
      })
          .catch(function (err) {
              clearTimeout(timer);
              reject(err);
          });
  });
}

module.exports = offlineFetch;
