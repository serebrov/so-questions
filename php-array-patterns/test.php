<?php

function getRepeatCount($array, $chunk_size) {
    $parts = array_chunk($array, $chunk_size);
    $maxRepeats = 1;
    $maxIdx = 0;
    $maxChunk = $parts[0];
    for ($i = 0; $i < count($parts)-1; $i++) {
        $repeats = 1;
        $idx = $i;
        $prev = $parts[$idx];
        $current = $parts[$idx];
        do {
            $idx++;
            $current = $parts[$idx];
            // if chunks equal
            if (json_encode($prev) === json_encode($current)) {
                $repeats += 1;
                if ($repeats > $maxRepeats) {
                    $maxRepeats = $repeats;
                    $maxIdx = $i;
                    $maxChunk = $current;
                }
            } else {
                break;
            }
        } while($idx < count($parts)-1);
    }
    return array($maxRepeats, $maxIdx*$chunk_size, $maxChunk);
}

function findLongestPattern($array) {
    $start = 0;
    $maxLen = 0;
    $maxRepeats = 0;
    $maxPattern = array();
    $len = count($array);
    for ($window = 1; $window <= $len/2; $window++) {
      for ($i = 0; $i < $len-$window; $i++) {
          list($repeats, $idx, $pattern) = getRepeatCount(
              array_slice($array, $i), $window
          );
        if ($window > $maxLen) {
            //if (!$maxRepeats || $repeats >= $maxRepeats) {
            if (!$maxRepeats || $repeats > 1) {
                $maxLen = $window;
                $maxRepeats = $repeats;
                $maxPattern = $pattern;
                $start = $idx + $i;
            }
        }
      }
    }
    return array($maxRepeats, $start, $maxPattern);
}

function splitToPatterns($array) {
    //echo json_encode($array);
    if (count($array) < 1) {
        return $array;
    }
    if (count($array) < 2) {
        return array(
            array('number'=>1, 'values' => $array)
        );
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
        //var_dump($actual);
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
