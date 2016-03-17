<?php

//$connect = odbc_connect("database", "user", "password");

header("Access-Control-Allow-Origin: *");

# query the users table for name and surname
/* $query = "SELECT P1AFNR, P1AFHP, P1AFMG, P1L1DA, P1TENR, P1BEZ1, P1AKDN FROM AFP1E " */
/*     . "WHERE P1L1DA >= 20100101 and P1L1DA <= 99991231 AND P1ST01 < 68 " */
/*     . "AND P1PRKA = 'C' ORDER by P1L1DA"; */

# perform the query
/* $result = odbc_exec($connect, $query); */

$results = [
   [ 'OrderNo' => '111', 'OrderPos'=> '1'],
   [ 'OrderNo' => '222', 'OrderPos'=> '2']
];

// fetch the data from the database
$x = 1;
$outp = "";
foreach ($results as $result) {
   if ($outp != "") {$outp .= ",";}
$outp .= '{"OrderNo":"'     .$result['OrderNo']                            .'",';
$outp .= '"OrderPos":"'     .$result['OrderPos']                            .'"}';
}
$outp ='{"orders":['.$outp.']}';
// {"orders":[{"OrderNo":"111","OrderPos":"1"},{"OrderNo":"222","OrderPos":"2"}]}

header("Content-Type: application/json");
echo($outp);
