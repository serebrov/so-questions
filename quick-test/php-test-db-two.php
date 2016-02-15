<?php
define("DB_SERVER", "localhost");
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_NAME", "sotest_users_two");

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

function select($columns = array(), $table, $variables = '', $order = '') {
    // Are the required variables empty or equals null?
    if(empty($columns) || empty($table)) {
        return false;
    }

    // Set $order and $variables to false
    if($order == '' || $order == null) {
        $order = false;
    }else if($variables == '' || $variables == null) {
        $variables = false;
    }

    // Check if $columns is an array
    if(!is_array($columns)) {
        return false;
    }

    // Set $fields as an array
    $fields = array();
    // Individualise the array
    foreach($columns as $field) {
        $fields[] = $field;
    }

    // Sepeate all individuals with commas
    $fields = implode(', ', $fields);

    // Finalise the MySQLi query
    if($variables == false && $order == false) {
        $query = "SELECT $fields FROM $table";
    }else if($variables != false && $order == false) {
        $query = "SELECT $fields FROM $table WHERE $variables";
    }else if($variables == false && $order != false) {
        $query = "SELECT $fields FROM $table ORDER BY $order";
    }else if($variables != false && $order != false) {
        $query = "SELECT $fields FROM $table WHERE $variables ORDER BY $order";
    }

    // Prepare the query for executing
    //$connection = new PDO('mysql:dbname='.DB_NAME.';host='.DB_SERVER, DB_USER, DB_PASS);
    $connection = new mysqli(DB_SERVER, DB_USER, DB_PASS, DB_NAME);
    $stmt = $connection->prepare($query);

    // Execute the query
    $stmt->execute();

    // Get the results of the query
    $result = $stmt->get_result();

    // Set the results to a variable
    while($row = ( is_object($result)) ? $result->fetch_assoc() : $result->fetch_object() ) {
        $results[] = $row;
    }

    // Return the results as array 0
    return $results[0];
}

function register($username, $password, $confirmpassword, $email, $firstname, $lastname) {
        if(empty($username) || empty($password) || empty($confirmpassword) || empty($email) || empty($firstname) || empty($lastname)) {
            return false;
        }

        if($password === $confirmpassword) {
            //$dbc = new dbc();

            $hash = '_HG.g2Sxa.';
            $encryptpassword = md5(md5($hash . $password));

            $usernameQuery = select(array('*'), 'users', 'username="' . $username .'"');
            $usernameCount = $usernameQuery->num_rows;

            if($usernameCount != 0) {
                echo 'Username already exists!';
            }

            $userdata = array(
                'username' => $username,
                'password' => $encryptpassword,
                'email' => $email,
                'firstname' => $firstname,
                'lastname' => $lastname,
                'status' => '1',
                'ip' => '127.0.0.1'
            );

            $dbc->insert('users', $userdata);
        }else {
            return false;
        }
    }

register('one', 'pass', 'pass', 'mail', 'first', 'last');
