<?php 
    $strCountries = file_get_contents("../data/countryBorders.geo.json");
    $json = json_decode($strCountries);
    $countries = $json->features;
    
    $countriesArray = array();


    foreach($countries as $obj) {
        // var_dump($obj->properties);
        $props = $obj->properties;
        $array = [$props->name, $props->iso_a2];
        // print_r($array);
        array_push($countriesArray, $array);
    }

  
    // PHP 7+
    usort($countriesArray, function ($key1, $key2) {
        return $key1[0] <=> $key2[0];
    });
    
    print_r(json_encode($countriesArray));
    
?>