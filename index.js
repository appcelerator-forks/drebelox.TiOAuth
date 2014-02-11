
var OAuth = require('lib/oauth');

function TitaniumOAuth(ck, cs, at, ts) {
  var consumer = {
    consumerKey: ck,
    consumerSecret: cs,
    accessToken: at,
    serviceProvider: {
      signatureMethod: 'HMAC-SHA1',
      requestTokenURL: 'https://vimeo.com/oauth/request_token',
      userAuthorizationURL: 'https://vimeo.com/oauth/authorize',
      accessTokenURL: 'https://vimeo.com/oauth/access_token',
      oauthVersion: '1.0'
    }
  };

  var accessor = {
    consumerSecret: consumer.consumerSecret,
    tokenSecret: ts
  };

  // Request
  this.request = function(options, callback) {
    var message = {
      method: options.method,
      action: options.action,
      parameters: [
        ['oauth_signature_method', consumer.serviceProvider.signatureMethod],
        ['oauth_consumer_key', consumer.consumerKey],
        ['oauth_version', consumer.serviceProvider.oauthVersion],
        ['oauth_token', consumer.accessToken]
      ]
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var finalUrl = OAuth.addToURL(message.action, message.parameters);
    var xhr = Titanium.Network.createHTTPClient({
      timeout: 200000
    });

    xhr.onload = function() {
      callback(this.responseText);
    };

    xhr.onerror = function(e) {
      Ti.UI.createAlertDialog({
        title: 'Service Unavailable',
        message: 'An error ocurred while making a request.'
      }).show();
    };

    xhr.open(options.method, finalUrl, false);
    xhr.send();
  };
};

module.exports = TitaniumOAuth;
