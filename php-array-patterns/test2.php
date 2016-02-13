<?php

# This is a solution based on this answer - http://stackoverflow.com/a/35071955/4612064

function splitToPatterns($array) {
    $length = count($array);
    if ($length < 1) {
        return $array;
    }
    $pos = 0;
    $repeats = 1;
    $last_window = 1;
    // Scan from the start of the array, from the bigger window to smaller
    for ($win = floor($length/2); $win > 0; $win--) {
        while (array_slice($array, $pos, $win)==array_slice($array, $pos+$win, $win)) {
            $last_window = $win;
            $pos += $win;
            $repeats++;
        }
        if ($repeats > 1) {
            break;
        }
    }

    // scan the rest of the array
    $next = splitToPatterns(array_slice($array, $pos+$last_window));
    //return array_merge(Array(Array('number'=>$repeats, 'values'=>array_slice($array, $pos, $last_window))), $next);

    // this is for the case when larger pattern doesn't start from the beginning, like
    //   'one', 'two', 'one', 'two', 'three', 'four', 'one', 'two', 'three', 'four'
    //   [    ] [    ] [                            ] [                            ]
    // so we shift by 1 element and check the rest
    $shift = splitToPatterns(array_slice($array, 1));

    // Now check where we have less items (= more repeats)
    if (count($next) < count($shift)+1) {
      return array_merge(Array(Array('number'=>$repeats, 'values'=>array_slice($array, $pos, $last_window))), $next);
    }
    return array_merge(Array(Array('number'=>1, 'values'=>array_slice($array, 0, 1))), $shift);
}

function isEquals($expected, $actual) {
    $exp_str = json_encode($expected);
    $act_str = json_encode($actual);
    $equals = $exp_str === $act_str;
    if (!$equals) {
        echo 'Equals check failed'.PHP_EOL;
        echo 'expected: '.$exp_str.PHP_EOL;
        echo 'actual  : '.$act_str.PHP_EOL;
    }
    return $equals;
}


// Find longest adjacent non-overlapping patterns
assert(isEquals(
    array(
        array('number'=>1, 'values'=>array('a')),
        array('number'=>1, 'values'=>array('b')),
        array('number'=>1, 'values'=>array('c')),
    ),
    splitToPatterns(['a','b','c'])
));
assert(isEquals(
    array(
        array('number'=>1, 'values'=>array('a')),
        array('number'=>1, 'values'=>array('b')),
        array('number'=>2, 'values'=>array('c','a')),
    ),
    splitToPatterns(['a','b','c','a','c','a'])
));
assert(isEquals(
    array(
        array('number'=>2, 'values'=>array('a','b','c','d')),
        array('number'=>1, 'values'=>array('c')),
        array('number'=>1, 'values'=>array('d')),
    ),
    splitToPatterns(['a','b','c','d','a','b','c','d','c','d'])
));
/*     'a', 'b', 'a', 'b', 'a', 'b', 'a', 'b', 'c', 'd', */
/*     [                 ] [                 ] [ ]  [  ] */
/* NOT [      ] [        ] [      ]  [       ] [ ]  [  ] */
assert(isEquals(
    array(
        array('number'=>2, 'values'=>array('a','b','a','b')),
        array('number'=>1, 'values'=>array('c')),
        array('number'=>1, 'values'=>array('d')),
    ),
    splitToPatterns(['a','b','a','b','a','b','a','b','c','d'])
));

/*     'x', 'x', 'y', 'x', 'b', 'x', 'b', 'a' */
/* //  [  ] [  ] [ ]  [       ] [      ]  [ ] */
assert(isEquals(
    array(
        array('number'=>2, 'values'=>array('x')),
        array('number'=>1, 'values'=>array('y')),
        array('number'=>2, 'values'=>array('x','b')),
        array('number'=>1, 'values'=>array('a')),
    ),
    splitToPatterns(['x','x','y','x','b','x','b','a'])
));
// one, two, one, two, one, two, one, two
// [                ] [                 ]
assert(isEquals(
    array(
        array('number'=>2, 'values'=>array('one', 'two', 'one', 'two')),
    ),
    splitToPatterns(['one', 'two', 'one', 'two', 'one', 'two', 'one', 'two'])
));
// 'one', 'two', 'one', 'two', 'three', 'four', 'one', 'two', 'three', 'four'
// [   ]  [   ]  [                           ]  [                           ]
assert(isEquals(
    array(
        array('number'=>1, 'values'=>array('one')),
        array('number'=>1, 'values'=>array('two')),
        array('number'=>2, 'values'=>array('one','two','three','four')),
    ),
    splitToPatterns(['one', 'two', 'one', 'two', 'three', 'four', 'one', 'two', 'three','four'])
));

/*     'a', 'a', 'b', 'a', 'b', 'a', 'b', 'a', 'b', 'c', */
/*     [  ] [                 ] [                 ] [ ]  */
assert(isEquals(
    array(
        array('number'=>1, 'values'=>array('a')),
        array('number'=>2, 'values'=>array('a','b','a','b')),
        array('number'=>1, 'values'=>array('c')),
    ),
    splitToPatterns(['a','a','b','a','b','a','b','a','b','c'])
));

/* 'a', 'b', 'a', 'b', 'c', 'd', 'a', 'b', 'a', 'b', 'a', 'b' */
// [      ]  [      ]  [ ]  [ ]  [      ] [       ]  [      ]
assert(isEquals(
    array(
        array('number'=>2, 'values'=>array('a', 'b')),
        array('number'=>1, 'values'=>array('c')),
        array('number'=>1, 'values'=>array('d')),
        array('number'=>3, 'values'=>array('a','b')),
    ),
    splitToPatterns(['a', 'b', 'a', 'b', 'c', 'd', 'a', 'b', 'a', 'b', 'a', 'b'])
));
/* 'a', 'c', 'd', 'a', 'b', 'a', 'b', 'a', 'b', 'a', 'b', 'c', */
/* [  ] [  ] [  ] [                 ] [                 ] [ ]  */
assert(isEquals(
    array(
        array('number'=>1, 'values'=>array('a')),
        array('number'=>2, 'values'=>array('a','b','a','b')),
        array('number'=>1, 'values'=>array('c')),
    ),
    splitToPatterns(['a','a','b','a','b','a','b','a','b','c'])
));
