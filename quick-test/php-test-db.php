<?php
define("DB_SERVER", "localhost");
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_NAME", "sotest_users");

function query($mysqli, $text) {
    print 'Query: ' . $text . PHP_EOL;
    $result = $mysqli->query($text);
    if ($result === false) {
        print 'Query error: ' . $mysqli->error . PHP_EOL;
        die();
    }
    return $result;
}

$mysqli = new mysqli(DB_SERVER, DB_USER, DB_PASS);
query($mysqli, 'drop database if exists ' . DB_NAME);
query($mysqli, 'create database ' . DB_NAME);
$mysqli->select_db(DB_NAME);
query($mysqli, 'create table users (userId integer, username text, password text)');
query($mysqli, 'insert into users (userId, username, password) values (1, "test", "test")');

$result = query($mysqli, 'select * from users where userId=1');
while ($row = $result->fetch_assoc()) {
    print json_encode($row) . PHP_EOL;
}
$result->close();


// Your code here

class Database {
    //...
}

$db = new Database();

class User {
    //...
}

print 'Start' . PHP_EOL;
$user = User::getUserId(1);
var_dump($user);
//echo $user->getName();
