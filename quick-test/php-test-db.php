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

class Database {
    private $connection;

    function __construct() {
        $this->connect();
    }

    public function connect() {
        $this->connection = mysqli_connect(DB_SERVER, DB_USER, DB_PASS, DB_NAME);
        if(mysqli_connect_errno()) {
            die("Database connection failed: " .
               mysqli_connect_error() .
               " (" . mysqli_connect_errno() . ")"
            );
        }
    }

    public function disconnect() {
        if(isset($this->connection)) {
            mysqli_close($this->connection);
            unset($this->connection);
        }
    }

    public function query($sql) {
        $result = mysqli_query($this->connection, $sql);
        if (!$result) {
            die("Database query failed.");
        }
        return $result;
    }

    public function prepare($data) {
        $escString = mysqli_real_escape_string($this->connection, $data);
        return $escString;
    }

    public function fetchArray($results) {
        return mysqli_fetch_array($results);
    }
}

$db = new Database();

class User {

    public $userId;
    public $username;
    public $password;
    public $email;
    public $firstname;
    public $lastname;
    public $access;
    public $active;

    public static function getUsers() {
        return self::getBySQL("SELECT * FROM users");
    }

    public static function getUserId($id=0) {
        global $db;
        $result = self::getBySQL("SELECT * FROM users WHERE userId={$id} LIMIT 1");
        return !empty($result) ? array_shift($result) : false;
    }

    public static function getBySQL($sql) {
        global $db;
        $result = $db->query($sql);
        $objArray = array();
        while ($row = $db->fetchArray($result)) {
            $objArray[] = self::instantiate($row);
        }
        return $objArray;
    }

    public function getName() {
        if (isset($this->firstname) && isset($this->lastname)) {
            return $this->firstname . " " . $this->lastname;
        } else {
            return "";
        }
    }

    private static function instantiate($record) {
        $object = new self;

        foreach($record as $attr=>$value){
            if($object->hasAttr($attr)) {
                $object->$attr = $value;
            }
        }
        return $object;
    }

    private function hasAttr($attr) {
        $objectVars = get_object_vars($this);
        return array_key_exists($attr, $objectVars);
    }
}

print 'Start' . PHP_EOL;
$user = User::getUserId(1);
var_dump($user);
//echo $user->getName();
