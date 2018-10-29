<!DOCTYPE html>

<html>
<head>
    <title>Summernote upload test</title>
    <!-- include libraries(jQuery, bootstrap) -->
    <link href="http://netdna.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.css" rel="stylesheet">
    <script src="http://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.js"></script>
    <script src="http://netdna.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.js"></script>

    <!-- include summernote css/js -->
    <link href="http://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.9/summernote.css" rel="stylesheet">
    <script src="http://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.9/summernote.js"></script>
</head>
<body>

<form name="myEditor" id="myEditor" method="post" action="show.php" enctype="multipart/form-data">
    <textarea id="summernote" name="summernote"></textarea>
    <input type="submit" />
</form>

<script type="text/javascript">
    $(function() {

        $('#summernote').summernote({
            placeholder: 'Write something...',
            lang: 'it-IT',
            height: 500,
            minHeight: null,
            maxHeight: null,
            focus: true,
            callbacks: {
                onImageUpload: function(files) {
                    editor = $(this);
                    doTheUpload(files[0], editor);
                }
            }
        });

        function doTheUpload(uploadedImage, myEditor) {
            var myForm = new FormData();
            myForm.append("imageField", uploadedImage);
            $.ajax({
                url: "upload.php",
                cache: false,
                contentType: false,
                processData: false,
                data: myForm,
                type: "post",
                success: function(imageUrl) {
                    var image = $('<img>').attr('src', imageUrl);
                    $(myEditor).summernote("insertNode", image[0]);
                },
                error: function(myForm) {
                    console.log(myForm);
                }
            });
        }

    });
</script>
</body>
