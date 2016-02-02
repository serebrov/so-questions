<?php

/*
 * Splits an $array into chunks of $chunk_size.
 * Returns number of repeats, start index and chunk which has
 * max number of ajacent repeats.
 */
function getRepeatCount($array, $chunk_size) {
    $parts = array_chunk($array, $chunk_size);
    $maxRepeats = 1;
    $maxIdx = 0;
    $repeats = 1;
    $len = count($parts);
    for ($i = 0; $i < $len-1; $i++) {
        if ($parts[$i] === $parts[$i+1]) {
            $repeats += 1;
            if ($repeats > $maxRepeats) {
                $maxRepeats = $repeats;
                $maxIdx = $i - ($repeats-2);
            }
        } else {
            $repeats = 1;
        }
    }
    return array($maxRepeats, $maxIdx*$chunk_size, $parts[$maxIdx]);
}

/*
 * Finds longest pattern in the $array.
 * Returns number of repeats, start index and pattern itself.
 */
function findLongestPattern($array) {
    $len = count($array);
    for ($window = floor($len/2); $window >= 1; $window--) {
      $num_chunks = ceil($len/$window);
      for ($i = 0; $i < $num_chunks; $i++) {
        list($repeats, $idx, $pattern) = getRepeatCount(
          array_slice($array, $i), $window
        );
        if ($repeats > 1) {
            return array($repeats, $idx+$i, $pattern);
        }
      }
    }
    return array(1, 0, [$array[0]]);
}

/*
 * Splits $array into longest adjacent non-overlapping parts.
 */
function splitToPatterns($array) {
    if (count($array) < 1) {
        return $array;
    }
    list($repeats, $start, $pattern) = findLongestPattern($array);
    $end = $start + count($pattern) * $repeats;
    return array_merge(
            splitToPatterns(array_slice($array, 0, $start)),
            array(
                array('number'=>$repeats, 'values' => $pattern)
            ),
            splitToPatterns(array_slice($array, $end))
    );
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

assert(isEquals(
    array(1, 0, ['a']), getRepeatCount(['a','b','c'], 1)
));
assert(isEquals(
    array(1, 0, ['a']), getRepeatCount(['a','b','a','b','c'], 1)
));
assert(isEquals(
    array(2, 0, ['a','b']), getRepeatCount(['a','b','a','b','c'], 2)
));
assert(isEquals(
    array(1, 0, ['a','b','a']), getRepeatCount(['a','b','a','b','c'], 3)
));
assert(isEquals(
    array(3, 0, ['a','b']), getRepeatCount(['a','b','a','b','a','b','a'], 2)
));
assert(isEquals(
    array(2, 2, ['a','c']), getRepeatCount(['x','c','a','c','a','c'], 2)
));
assert(isEquals(
    array(1, 0, ['x','c','a']), getRepeatCount(['x','c','a','c','a','c'], 3)
));
assert(isEquals(
    array(2, 0, ['a','b','c','d']),
    getRepeatCount(['a','b','c','d','a','b','c','d','c','d'],4)
));

assert(isEquals(
    array(2, 2, ['a','c']), findLongestPattern(['x','c','a','c','a','c'])
));
assert(isEquals(
    array(1, 0, ['a']), findLongestPattern(['a','b','c'])
));
assert(isEquals(
    array(2, 2, ['c','a']),
    findLongestPattern(['a','b','c','a','c','a'])
));
assert(isEquals(
    array(2, 0, ['a','b','c','d']),
    findLongestPattern(['a','b','c','d','a','b','c','d','c','d'])
));


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
