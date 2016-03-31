<?php
define("DB_SERVER", "localhost");
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_NAME", "sotest_pdo");

function query($connection, $text) {
    print 'Query: ' . $text . PHP_EOL;
    $result = $connection->query($text);
    if ($result === false) {
        print 'Query error: ' . $connection->error . PHP_EOL;
        die();
    }
    return $result;
}

function print_query($connection, $query) {
    $result = query($connection, $query);
    while ($row = $result->fetchAll()) {
        print json_encode($row) . PHP_EOL;
    }
}

$connection = new PDO('mysql:host='.DB_SERVER, DB_USER, DB_PASS);
query($connection, 'drop database if exists ' . DB_NAME);
query($connection, 'create database ' . DB_NAME);
$connection = new PDO('mysql:dbname='.DB_NAME.';host='.DB_SERVER, DB_USER, DB_PASS);
query($connection, 'create table users (id integer, name text, password text)');
query($connection, 'insert into users (id, name, password) values (1, "test", "test")');
query($connection, 'insert into users (id, name, password) values (2, "test2", "test2")');
print_query($connection, 'select * from users');

class DB {
    private $dbconn;

    public function __construct($dbname, $dbhost='127.0.0.1', $dbuser='root', $dbpass='') {
        // also don't catch the error here, let it propagate, you will clearly see
        // what happend from the original exception message
        $this->dbconn = new PDO("mysql:host=$dbhost;dbname=$dbname;", $dbuser, $dbpass, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'UTF8'"));
    }

    public function insertUnsafe($table, $data) {
        // again, no need to try / catch here, let the exceptions
        // do their job
        // handle errors only in the case you are going to fix them
        // and not just to ingnore them and 'echo', this can lead to much worse problems
        $fields = array();
        $placeholders = array();
        $values = array();
        foreach($data as $key=>$value) {
            $fields[] = $key;
            // you can also process some special values like 'now()' here
            $placeholders[] = '?';
        }
        $fields = implode($fields, ','); // firstname, lastname
        $placeholders = implode($placeholders, ','); // ?, ?
        $sql = "INSERT INTO $table ($fields) values ($placeholders)";
        $stmt = $this->dbconn->prepare($sql);
        $stmt->execute(array_values($data));
        if ($stmt->execute(array_values($data)) === false) {
            print 'Error: ' . json_encode($stmt->errorInfo()). PHP_EOL;
        }
        while ($row = $stmt->fetchAll()) {
            print json_encode($row) . PHP_EOL;
        }
    }

    public function insert($table, $data) {
        // again, no need to try / catch here, let the exceptions
        // do their job
        // handle errors only in the case you are going to fix them
        // and not just to ingnore them and 'echo', this can lead to much worse problems
        $table = $this->backtick($table);
        $fields = array();
        $placeholders = array();
        $values = array();
        foreach($data as $key=>$value) {
            $fields[] = $this->backtick($key);
            // you can also process some special values like 'now()' here
            $placeholders[] = '?';
        }
        $fields = implode($fields, ','); // firstname, lastname
        $placeholders = implode($placeholders, ','); // ?, ?
        $sql = "INSERT INTO $table ($fields) values ($placeholders)";
        $stmt = $this->dbconn->prepare($sql);
        $stmt->debugDumpParams();
        if ($stmt->execute(array_values($data)) === false) {
            print 'Error: ' . json_encode($stmt->errorInfo()). PHP_EOL;
        }
        while ($row = $stmt->fetchAll()) {
            print json_encode($row) . PHP_EOL;
        }
    }

    public function updateUnsafe($table, $id, $data) {
        // again, no need to try / catch here, let the exceptions
        // do their job
        // handle errors only in the case you are going to fix them
        // and not just to ingnore them and 'echo', this can lead to much worse problems
        $fields = array();
        foreach($data as $key=>$value) {
            $fields[] = $key . " = ?";
        }
        $fields = implode($fields, ','); // firstname=?, lastname=?
        $sql = "UPDATE $table SET $fields where id=?";
        $stmt = $this->dbconn->prepare($sql);
        $data['id'] = $id;
        $stmt->debugDumpParams();
        $stmt->execute(array_values($data));
        if ($stmt->execute(array_values($data)) === false) {
            print 'Error: ' . json_encode($stmt->errorInfo()). PHP_EOL;
        }
        while ($row = $stmt->fetchAll()) {
            print json_encode($row) . PHP_EOL;
        }
    }

    public function update($table, $id, $data) {
        $table = $this->backtick($table);
        $fields = array();
        foreach($data as $key=>$value) {
            $fields[] = $this->backtick($key) . " = ?";
        }
        $fields = implode($fields, ','); // firstname=?, lastname=?
        $sql = "UPDATE $table SET $fields where id=?";
        $stmt = $this->dbconn->prepare($sql);
        $data['id'] = $id;
        $stmt->debugDumpParams();
        $stmt->execute(array_values($data));
        if ($stmt->execute(array_values($data)) === false) {
            print 'Error: ' . json_encode($stmt->errorInfo()). PHP_EOL;
        }
        while ($row = $stmt->fetchAll()) {
            print json_encode($row) . PHP_EOL;
        }
    }

    private function backtick($key) {
        return "`".str_replace("`","``",$key)."`";
    }

    function debug($query) {
        print 'start results'.PHP_EOL;
        $result = query($this->dbconn, $query);
        while ($row = $result->fetchAll()) {
            print json_encode($row) . PHP_EOL;
        }
        print 'end results'.PHP_EOL;
    }
}

$db = new DB(DB_NAME, DB_SERVER, DB_USER, DB_PASS);
//$db->insertUnsafe('users', array('name'=>'new user', 'password'=>'text'));
$db->insert('users', array('name'=>'new user', 'password'=>'text'));
$db->debug('select * from users');
print '--Start the SQL indection test--'.PHP_EOL;
$db->updateUnsafe('users', 2, array("name=(SELECT'bad guy')WHERE`id`=1#"=>'', 'name'=>'user2', 'password'=>'text'));
// the statement about should change the name of the user with id 1 to "bad guy"
$db->debug('select * from users where id = 1');
print '--Start the SQL indection test #2--'.PHP_EOL;
$db->update('users', 2, array("name=(SELECT'bad guy')WHERE`id`=2#"=>'', 'name'=>'user2', 'password'=>'text'));
// the statement about should change the name of the user with id 1 to "bad guy"
$db->debug('select * from users where id = 2');
