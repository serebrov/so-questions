<?php

$array1 = [
    [ 'BLA' => 'bis 050' ],
    [ 'BLA' => 'bis 060' ]
];

$array2 = [
    [ 'BLA' => 'bis 050', 'Amount' => '832'],
    [ 'BLA' => 'bis 060', 'Amount' => '484']
];

function updateAmount($item, $source) {
    forEach ($source as $idx => $sourceItem) {
        if ($item['BLA'] === $sourceItem['BLA']) {
            $item['Amount'] = $sourceItem['Amount'];
            return $item;
        }
    }
    $item['Amount'] = 0;
    return $item;
}

forEach ($array1 as $idx => $item) {
    $array1[$idx] = updateAmount($item, $array2);
}
print json_encode($array1, JSON_PRETTY_PRINT);
