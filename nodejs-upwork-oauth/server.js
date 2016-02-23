var OAuth   = require('oauth-1.0a');
var request = require('request');
require('request-debug')(request);
var qs = require('querystring');

var oauthTest = module.exports = { }

oauthTest.consumer = {
    public: 'd143646921cb9e460f93abd971113c4a',
    secret: '0cc3cd641cc79b68'
};
oauthTest.oauth = OAuth({
    consumer: oauthTest.consumer,
    signature_method: 'HMAC-SHA1'
});

oauthTest.tempToken = {
    public: '',
    secret: ''
};
oauthTest.accessToken = {
    public: '',
    secret: ''
};

oauthTest.step1_tempToken = function() {
    var request_data = {
        url: 'https://www.upwork.com/api/auth/v1/oauth/token/request',
        method: 'POST',
        data: {}
    };
    request({
        url: request_data.url,
        method: request_data.method,
        form: oauthTest.oauth.authorize(request_data) // no token yet
    }, function(error, response, body) {
        //process your data here
        if (error) {
          console.log(error);
        }
        console.log(body);
        var data = qs.parse(body);
        oauthTest.tempToken.public = data.oauth_token;
        oauthTest.tempToken.secret = data.oauth_token_secret;
        console.log(oauthTest.tempToken);
    });
};

oauthTest.step3_accessToken = function(oauth_verifier) {
    var request_data = {
        url: 'https://www.upwork.com/api/auth/v1/oauth/token/access',
        method: 'POST',
        data: {
          oauth_verifier: oauth_verifier
        }
    };
    request({
        url: request_data.url,
        method: request_data.method,
        form: oauthTest.oauth.authorize(request_data, oauthTest.tempToken) // use the temp token
    }, function(error, response, body) {
        //process your data here
        if (error) {
          console.log(error);
        }
        console.log(body);
        var data = qs.parse(body);
        oauthTest.accessToken.public = data.oauth_token;
        oauthTest.accessToken.secret = data.oauth_token_secret;
        console.log(oauthTest.accessToken);
    });
};

function getOauthData(data) {
    var url = '';
    url += "oauth_consumer_key="+data.oauth_consumer_key;
    url += "&oauth_signature="+data.oauth_signature;
    url += "&oauth_nonce="+data.oauth_nonce;
    url += "&oauth_signature_method="+data.oauth_signature_method;
    url += "&oauth_timestamp="+data.oauth_timestamp;
    url += "&oauth_token="+data.oauth_token;
    url += "&oauth_version="+data.oauth_version;
    return url;
}

oauthTest.queryAPI = function() {
    var request_data = {
        url: 'https://www.upwork.com/api/profiles/v2/search/jobs.json',
        method: 'GET',
        data: {
          'q': 'java'
        }
    };

    //manually construct the url
    // var data = oauthTest.oauth.authorize(request_data, oauthTest.accessToken) // use the access token
    // var url = request_data.url + '?q=java&' + getOauthData(data);
    // console.log(url);
    // console.log(data);

    request({
        //url: url,
        url: request_data.url,
        method: request_data.method,
        qs: oauthTest.oauth.authorize(request_data, oauthTest.accessToken) // use the access token
    }, function(error, response, body) {
        //process your data here
        if (error) {
          console.log(error);
        }
        console.log(body);
    });
};
