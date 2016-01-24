<?php
//question: http://stackoverflow.com/q/34943841/4612064
//original code from http://stackoverflow.com/a/32710756/1620626
//
// It takes images/01.png and adds images/background.png as a background,
// replacing the blue color on the original image.
//
// Run as php convert.php > out.php
//
//
function RGBtoHSL( $r, $g, $b ) {
    $r /= 255;
    $g /= 255;
    $b /= 255;
    $max = max( $r, $g, $b );
    $min = min( $r, $g, $b );
    $l = ( $max + $min ) / 2;
    $d = $max - $min;
    if( $d == 0 ){
        $h = $s = 0;
    } else {
        $s = $d / ( 1 - abs( 2 * $l - 1 ) );
        switch( $max ){
            case $r:
                $h = 60 * fmod( ( ( $g - $b ) / $d ), 6 );
                if ($b > $g) {
                    $h += 360;
                }
                break;
            case $g:
                $h = 60 * ( ( $b - $r ) / $d + 2 );
                break;
            case $b:
                $h = 60 * ( ( $r - $g ) / $d + 4 );
                break;
        }
    }
    return array( round( $h, 2 ), round( $s, 2 ), round( $l, 2 ) );
}

function HSLtoRGB( $h, $s, $l ){
    $c = ( 1 - abs( 2 * $l - 1 ) ) * $s;
    $x = $c * ( 1 - abs( fmod( ( $h / 60 ), 2 ) - 1 ) );
    $m = $l - ( $c / 2 );
    if ( $h < 60 ) {
        $r = $c;
        $g = $x;
        $b = 0;
    } else if ( $h < 120 ) {
        $r = $x;
        $g = $c;
        $b = 0;
    } else if ( $h < 180 ) {
        $r = 0;
        $g = $c;
        $b = $x;
    } else if ( $h < 240 ) {
        $r = 0;
        $g = $x;
        $b = $c;
    } else if ( $h < 300 ) {
        $r = $x;
        $g = 0;
        $b = $c;
    } else {
        $r = $c;
        $g = 0;
        $b = $x;
    }
    $r = ( $r + $m ) * 255;
    $g = ( $g + $m ) * 255;
    $b = ( $b + $m  ) * 255;
    return array( floor( $r ), floor( $g ), floor( $b ) );
}

/* ---------------CHANGE THESE------------------- */
$colorToReplace = RGBtoHSL(0,255,1);//target color
$hueAbsoluteError = 7;//the more the clearer
$replacementColor = RGBtoHSL(0, 192, 239);//new color
/* ---------------------------------------------- */

$filename = 'images/01.png';
$bgFilename = 'images/background.png';
$im = imagecreatefrompng($filename);
$bg = imagecreatefrompng($bgFilename);
$out = imagecreatetruecolor(imagesx($im), imagesy($im));
$transColor = imagecolorallocatealpha($out, 254, 254, 254, 127);
imagefill($out, 0, 0, $transColor);

for ($x = 0; $x < imagesx($im); $x++) {
    for ($y = 0; $y < imagesy($im); $y++) {
        $pixel = imagecolorat($im, $x, $y);
        $bgPixel = imagecolorat($bg, $x, $y);

        $red = ($pixel >> 16) & 0xFF;
        $green = ($pixel >> 8) & 0xFF;
        $blue = $pixel & 0xFF;
        $alpha = ($pixel & 0x7F000000) >> 24;
        $colorHSL = RGBtoHSL($red, $green, $blue);

        if ((($colorHSL[0]  >= $colorToReplace[0] - $hueAbsoluteError) && ($colorToReplace[0] + $hueAbsoluteError) >= $colorHSL[0])){
            // Instead of taking the replacementColor
            /* $color = HSLtoRGB($replacementColor[0], $replacementColor[1], $colorHSL[2]); */
            /* $red = $color[0]; */
            /* $green= $color[1]; */
            /* $blue = $color[2]; */
            // We just take colors from the backround image pixel
            $red = ($bgPixel >> 16) & 0xFF;
            $green = ($bgPixel >> 8) & 0xFF;
            $blue = $bgPixel & 0xFF;
        }

        if ($alpha == 127) {
            imagesetpixel($out, $x, $y, $transColor);
        }
        else {
            imagesetpixel($out, $x, $y, imagecolorallocatealpha($out, $red, $green, $blue, $alpha));
        }
    }
}
imagecolortransparent($out, $transColor);
imagesavealpha($out, TRUE);
header('Content-type: image/png');
imagepng($out);
?>
