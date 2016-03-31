<?php

$db = new PDO('mysql:host=localhost;dbname=test', 'root');

$sql = "SELECT * FROM service_table";
$q = $db -> query($sql);
$result = $q -> fetchall();
echo 'Result 0'.PHP_EOL;
var_dump($result);

$sql = "SELECT * FROM service_table";
$q = $db -> query($sql);
$result = $q -> fetchall(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
//$result = $q -> fetchall(PDO::FETCH_GROUP);
echo 'Result 1'.PHP_EOL;
var_dump($result);

$sql = "SELECT * FROM service_table";
$q = $db -> query($sql);
$q -> setFetchMode(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
$result = $q -> fetchall();
echo 'Result 2'.PHP_EOL;
var_dump($result);

$sql = "SELECT * FROM service_table";
$q = $db -> query($sql);
echo 'Result 3'.PHP_EOL;
do {
    $result = $q -> fetch(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
    var_dump($result);
} while ($result);

$sql = "SELECT * FROM service_table";
$q = $db -> query($sql);
$result = $q -> fetchall(PDO::FETCH_GROUP|PDO::FETCH_UNIQUE|PDO::FETCH_ASSOC);
echo 'Result 2'.PHP_EOL;
var_dump($result);

 array(2) {
  [1] => array(1) {
    'name' => string(3) "one"
  }
  [2] => array(1) {
    'name' => string(3) "two"
  }
}

//$result = $q -> fetchall(PDO::FETCH_GROUP);

/*

The explanation seems to is that fetchall() and setFetchMode() support different set of PDO::FETCH__ constants.

First, the code:

    <?php

    $db = new PDO('mysql:host=localhost;dbname=test', 'root');

    $sql = "SELECT * FROM service_table";
    $q = $db -> query($sql);
    $result = $q -> fetchall();
    echo 'Result 0'.PHP_EOL;
    var_dump($result);

    $sql = "SELECT * FROM service_table";
    $q = $db -> query($sql);
    $result = $q -> fetchall(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
    echo 'Result 1'.PHP_EOL;
    var_dump($result);

    $sql = "SELECT * FROM service_table";
    $q = $db -> query($sql);
    $q -> setFetchMode(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
    $result = $q -> fetchall();
    echo 'Result 2'.PHP_EOL;
    var_dump($result);

My test data is this:

    mysql> select * from test.service_table;
    +----+------+
    | id | name |
    +----+------+
    |  1 | one  |
    |  2 | two  |
    +----+------+

The output:

    Result 0 - this is the default, results are not grouped and
               contain both name-based and index-based fields
    array(2) {
      [0] =>
      array(4) {
        'id' => string(1) "1"
        [0] => string(1) "1"
        'name' => string(3) "one"
        [1] => string(3) "one"
      }
      [1] =>
      array(4) {
        'id' => string(1) "2"
        [0] => string(1) "2"
        'name' => string(3) "two"
        [1] => string(3) "two"
      }
    }

    Result 1 - this is the result of
               $q -> fetchall(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
               we have effect of both FETCH_GROUP and FETCH_ASSOC
    array(2) {
      [1] => array(1) {
        [0] => array(1) {
          'name' => string(3) "one"
        }
      }
      [2] => array(1) {
        [0] => array(1) {
          'name' => string(3) "two"
        }
      }
    }

    Result 2 - this is the result of
               $q -> setFetchMode(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
               we have only effect of FETCH_ASSOC
    array(2) {
      [0] => array(2) {
        'id' => string(1) "1"
        'name' => string(3) "one"
      }
      [1] => array(2) {
        'id' => string(1) "2"
        'name' => string(3) "two"
      }
    }

Now, the indirect confirmation from docs.
Here is the list of all constants (http://php.net/manual/en/pdo.constants.php), the description for PDO::FETCH_FUNC says:

     Allows completely customize the way data is treated on the fly (only valid inside PDOStatement::fetchAll()).

So we know that at least this constant is only works for the fetchAll() and can assume that other constants also can work not everywhere.

Also if we look at the docs for fetch() (http://php.net/manual/en/pdostatement.fetch.php), we will see a limited list of constants there.
For example PDO::FETCH_GROUP and PDO::FETCH_UNIQUE are present in the setFetchMode() documentation (http://php.net/manual/en/pdostatement.setfetchmode.php), but not present in the fetch() description.

So I think constant releated to multi-row operations, such as PDO::FETCH_GROUP are only used for fetchAll() and ignored by fetch() and setFetchMode().
 */
