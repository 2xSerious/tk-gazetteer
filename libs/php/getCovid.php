<?php
    $url = "http://corona-api.com/countries/" . $_GET['countryCode'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
    $result = curl_exec($ch);
    
    curl_close($ch);
    echo $result;
   
    
?>