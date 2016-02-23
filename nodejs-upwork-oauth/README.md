See: http://stackoverflow.com/questions/35408176/how-to-request-a-jsonp-file-via-jquery-ajax-from-the-upwork-api-that-uses-oauth

**TLDR** I am starting with the OAuth 1.0 process description to be sure that the code examples below and my conclusions will be clear.
Skip to the `The code` part if OAuth process is clear.

## The OAuth 1.0 process

I use the following terms below (they differ from the official terminology, but hopefully will make things clearer):

* App - your application
* Service - the service you request data from
* User - the user who gives you access his data stored by the Service

### Preparation. Register your App in the Service

You will get the client key and secret used to start the Oauth process.

In the case of Upwork, you do this here - https://www.upwork.com/services/api/apply.

### Step 1. Get the temporary oauth token.

This request is made by your App to the Service.
Your App passes the `client key`, so the Service knows who asks.

The request is signed using the `client secret`, the Service also has it and can verify if it is actually the request from your App and not from someone else who stole your client key (this is the reason why you shouldn't show your secret to anyone).

Server returns the `temporary oauth token` + `temporary oauth secret`.

In the case of Upwork you send this request to the https://www.upwork.com/api/auth/v1/oauth/token/request

### Step 2. Ask the user to grant you an access.

Your application just redirects the user to the special URL provided by Service.

The service shows a dialog where the user can provide access for your application.
This special URL includes the `temporary token` from the step 1, so the Service knows which application asks for the access.

If you have a web-application, you just open this special url in the browser.
The Service then redirects back to your App, using the `oauth_callback` (the URL to redirect the user back to).
The Service also passes the `oauth_verifier` to the `oauth_callback` URL.

If you have a desktop application, it should launch the browser and the Service can show the `oauth_verifier` as a string, so the user can manually copy it and paste back to your App. In this case you set the `oauth_calback` to the special `oob` (out-of-band) value.
This part (without the redirect back) is not strictly described in the specification, so the details depend on the Service.
It may be not supported at all or supported in some other way.

In the case of Upwork you send the user to the URL https://www.upwork.com/services/api/auth?oauth_token={temporary token}

### Step 3. Get the real oauth access token.

Your app sends the temporary token from the step 1 and oauth verifier from the step 2 to the Service.
The request is again signed, but this time using the `client secret` and `temporary token secret`.
Service responds with the access token + secret.

In the case of Upwork the URL is https://www.upwork.com/api/auth/v1/oauth/token/access

These are 3 steps to get the real access toking and start using the Service API.
The example in the specification is also good and clear, [check it](http://tools.ietf.org/html/rfc5849#section-1.2).

Also note that the OAuth 1.0 can not be safely used in 100% client-side apps.
On the step 1 you need to use the private `client secret` which should not be known to anyone (so you must not place it into your client-side code).
On the step 2 the Service will redirect the browser back to the `oauth_callback` and you can't handle it client-side.

Technically it is possible to use oauth client-side if you use the scenario without the callback like for the desktop application. In this case user will need to manually copy the verifier back to your application.
This scenario should also be supported by the Servcie (Upwork doesn't support it, see below).

### Step 4. Use the Service API

Now, once you get the access token, you can make API requests to get the data, here you send both your `client key` and the `access token` from the Step 3.
Requests are signed with `client secret` + `access token secret`.

The most complex part of the process is requests signing, it is covered in details in the specification, but this is where it is better to use a library.

The [oauth-1.0a](https://github.com/ddo/oauth-1.0a) allows you to sign your requests in node.js and in client-side javascript.
You still need to perform the oauth steps from your application, the library will only help you with signing.

## The code

I tested the `Step 1` from the browser javascript and Upwork doesn't support this scenario.
If I send the regular POST request with ajax, it returns the 'Access-Control-Allow-Origin` error. And if I try this request using `JSONP`, Upwork responds with the 404 error.

So there is no `JSONP` support for the `api/auth/v1/oauth/token/request` endpoint.

The Steps 1-3 should be done using the server-side (anyway client side authentication would be non-secure).

Here is how the token request looks (`Step 1`):

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
            var data = qs.parse(body);
            console.log(data);
        });
    };

The full code is [here](https://github.com/serebrov/so-questions/tree/master/nodejs-upwork-oauth).

Note that Upwork has the [nodejs library](https://github.com/upwork/node-upwork), but I didn't use it just to do all things manually.
Requests are signed using [oauth-1.0a](https://github.com/ddo/oauth-1.0a).

The `Step 2` is performed in the browser, here you just open the url like 'https://www.upwork.com/services/api/auth?oauth_token=xxx' and get the oauth verifier.
In the real-life scenario, your application will specify the `oauth_callback` parameter and Upwork will send the oauth verifier to your application.
In this example I just manually copy it from the browser and pass to the next step.

Having the oauth verifier, you can get the permanent access token (`Step 3`):

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
            var data = qs.parse(body);
            console.log(data);
        });
    };

Finally, you can use the API, `Step 4` (again, this is server-side code):

    oauthTest.queryAPI = function() {
        var request_data = {
            url: 'https://www.upwork.com/api/profiles/v2/search/jobs.json',
            method: 'GET',
            data: {
              'q': 'java'
            }
        };
        request({
            url: request_data.url,
            method: request_data.method,
            qs: oauthTest.oauth.authorize(request_data, oauthTest.accessToken) // use the access token
        }, function(error, response, body) {
            console.log(body);
        });
    };

It should be possible to do the same request from the browser this way:

    function queryAPI(public, secret) {
        var accessToken = {
            public: public,
            secret: secret
        }
        var request_data = {
            url: 'https://www.upwork.com/api/profiles/v2/search/jobs.json',
            method: 'GET',
            data: {
              'q': 'java'
            }
        };
        // https://developers.upwork.com/?lang=node#getting-started_cross-domain-requests
        $.ajax({
          url: request_data.url,
          dataType: 'JSONP',
          // here the data will contain 'q=java' as well as all the oauth parameters
          // the request type will be GET (since this is JSONP), so all parameters will
          // be converted to the query string
          // you can check the URL in the developer console, in the list of network requests
          data: oauth.authorize(request_data, accessToken),
          cache: true, // this removes the '_' parameter
          success:function(json){
            console.log(json);
          },
          error: function(error){
            console.log(error);
          },
        });
    };

According to the Upwork [docs](https://developers.upwork.com/?lang=node#getting-started_cross-domain-requests) it should work with `JSONP`.

But it returns the 'Verification of signature failed' error. The very similar request works from node.js code.

Also the example in the Upwork docs is incorrect, it says to add `callback=?` to the request, but jQuery adds this parameter automatically when you set `JSONP` data type. So probably some essential detail is missing from the docs or there is a problem on the Upwork side.

Note: after I revoked the authorization in the Upwork UI, the error changed to 'The consumer_key and token combination does not exist or is not enabled'.

Anyway, since you need the server side for Oauth, you also can use it to make the API requests to API and return to the client side.

### How to use the code example

Get the copy of the [nodejs-upwork-oauth]() folder, do `npm install` and start the node.js console:

    $ node
    > oauthTest = require('./server')
    > oauthTest.step1_tempToken()
    > // wait for the result
    { public: 'xxxx',
      secret: 'yyyy' }
    > // copy the public temp access token
    > // don't exit it yet
    >

Now open the `test.html` in the browser and open the JS console, run:

    > step2_askUser('temp_access_token_here')
    > // it will open the upwork auth page in new tab
    Application authorized

    jobs-alert has been authorized.
    Your oauth_verifier=zzzz

    You can close this window and return to your application.
    > // authorize there and copy the oauth_verifier

Go back to the nodejs console:

    > oauthTest.step3_accessToken('oauth verifier here')
    > // wait for the result
    { public: 'nnnnn',
      secret: 'kkkkk' }
    > oauthTest.queryAPI()
    > // see the query result
