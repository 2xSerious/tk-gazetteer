<?php
$strCountries = file_get_contents("../data/countryBorders.geo.json");
$json = json_decode($strCountries);
$countries = $json->features;

$countryBorders = "";
foreach ($countries as $obj) {
    // var_dump($obj->properties);

    if ($obj->properties->iso_a2 == $_GET['countryCode']) {
        $countryBorders = $obj;
    }
}
 $encode = json_encode($countryBorders);
    echo $encode;
?>