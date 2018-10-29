<?php
$path = "";
$return_value = "";
$path = 'img/';

if (!file_exists($path)) {
    mkdir($path);
}

if ($_FILES['imageField']['name']) {

    if (!$_FILES['imageField']['error']) {

        $filename = $_FILES['imageField']['name'];
        $temp_location = $_FILES['imageField']['tmp_name'];
        $final_destination = $path . $filename;

        if (!move_uploaded_file($temp_location, $final_destination)) {
            $return_value = $path . 'badimage.png';
        } else {
            $return_value = $final_destination;
        }

    } else {

        $return_value = "You triggered this error: " . $_FILES['imageField']['error'];

    }

}

echo $return_value;
?>
