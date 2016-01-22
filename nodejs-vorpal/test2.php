<?php
function markHashtags($matches)
{
    var_dump($matches[0]);
    return '<a href="#">' . $matches[0] . '</a>';
    if (is_array($match)) {
      foreach ($match as &$hashtag) {
        $hashtag = '<a href="#">' + $hashtag + '</a>';
      }
    }
    var_dump($match);
    return $match;
}

$str = "example text with #tag";
$HASHTAG_REXP = "/(#[A-Za-z]+)/m";

$message = preg_replace_callback($HASHTAG_REXP, "markHashtags", $str);
var_dump($message);
