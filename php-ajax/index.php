<!DOCTYPE html>

<html>
<head>
    <title>Ajax test</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
</head>
<body>
<div id="debug"></div>
<script>
var data = {'test': 'test'};
$("#debug").text(JSON.stringify(data));
// Try to save to a file
/* $.ajax({ */
/*     type: 'POST', */
/*     url: './json.php', */
/*     dataType: 'json', */
/*     //data: data, //JSON.stringify(data), (1) */
/*     data: JSON.stringify(data), */
/*     success: function(data, status, xhr) { // (2) */
/*         alert("response was " + data); */
/*     }, */
/*     error: function(xhr, status, errorMessage) { */
/*         $("#debug").append("RESPONSE: "+xhr.responseText+", error: "+errorMessage); */
/*     } */
/* }); */
$.ajax({
    type: 'POST',
    url: './json_string.php',
    data: {'json': JSON.stringify(data)},
    success: function(data, status, xhr) { // (2)
        alert("response was " + data);
    },
    error: function(xhr, status, errorMessage) {
        $("#debug").append("RESPONSE: "+xhr.responseText+", error: "+errorMessage);
    }
});
</script>
</body>
