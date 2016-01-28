http://stackoverflow.com/questions/34904109/angular-throws-errors-whenever-jquery-is-included

## TLDR

It looks like an angular bug (maybe specific to the 1.4.8 version and system.js usage).
The fix is to bootstrap the application [manually](https://docs.angularjs.org/guide/bootstrap#manual-initialization).

## Error analysis

The problem is that when angular app is bootstrapped with `ng-app`:

    <body ng-app="ByobApp">
        ...
    </body>

The application code loads `jquery` before `angular` (using system.js):

    import 'jquery';
    import "angular";
    var ByobApp = angular.module("ByobApp", []);

And angular raises an error:

    Uncaught Error: [$injector:modulerr]
    Failed to instantiate module ByobApp due to:
    Error: [$injector:nomod] Module 'ByobApp' is not available!
    You either misspelled the module name or forgot to load it.
    If registering a module ensure that you specify the dependencies
    as the second argument.
    http://errors.angularjs.org/1.4.8/$injector/nomod?p0=ByobApp

It works without an error if jquery import is removed or even if we swap jquery and angular:

    import "angular";
    import 'jquery';
    var ByobApp = angular.module("ByobApp", []);

## The workaround

It works if we initialize the angular application manually:

    <!-- do not include ng-app="ByobApp" here -->
    <body>
        <nav class="navbar navbar-default" role="navigation">
            ...
        </nav>

        <script src="/scripts/jspm_packages/system.js"></script>
        <script src="/scripts/config.js"></script>
        <script>
            System.baseURL = "/scripts";
            System['import']('app/app').then(function() {
                // Manually bootstrap once application is loaded
                angular.element(document).ready(function () {
                  angular.bootstrap(document, ['ByobApp']);
                });
            });

        </script>
    </body>

Test code:

- [index_bug.html](./index_bug.html) - version which raises an error
- [index.html](./index.html) - working version, click 'Home' to send message from one controller to another
- [app.js](./scripts/app/app.js) - application code
