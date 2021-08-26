<?php
    
    
    $url = "http://api.geonames.org/wikipediaBoundingBox?north=" . $_GET['north'] . "&south=" . $_GET['south'] ."&east=" . $_GET['east'] . "&west=". $_GET['west'] . "&username=2xserious";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_ENCODING, 'UTF-8');

    $result = curl_exec($ch);
    curl_close($ch);

    $xml = simplexml_load_string($result);
    $json = json_encode($xml);
    
    print_r($json);

?>