<!DOCTYPE html>
<html ng-app="XVASOrders">
    <head>
        <title>Angular - XVAS orders</title>
        <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.js"></script>
        <script src="XVASOrders.js"></script>

    </head>
    <body ng-controller="AS400data as AS400">
        <table>
            {{AS400.OrderData}} </br>
            {{AS400.OrderData.orders}} </br>
            {{AS400.OrderData.orders[0]}} </br>
            {{AS400.OrderData.orders[1]}}
            <tr ng-repeat="xord in AS400.OrderData.orders">
                <td>{{ xord.OrderNo }}</td>
                <td>{{ xord.OrderPos }}</td>
            </tr>
        </table>
    </body>
<script>
var app = angular.module('XVASOrders', []);
app.controller("AS400data", ['$http', function($http) {
    var self = this;
    $http.get("json.php")
    .then(function (res) {
       self.OrderData = res.data;
    //   this.OrderData = {"orders":[{"OrderNo":"175782","OrderPos":"1"},{"OrderNo":"176692","OrderPos":"3"}]};
        console.log(this.OrderData);
    });
}]);
</script>
</html>
