<?php 
    $url= "https://date.nager.at/api/v3/PublicHolidays/2021/" . $_GET['countryCode'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    $result = curl_exec($ch);
    curl_close($ch);



?>