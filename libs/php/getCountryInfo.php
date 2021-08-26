<?php
$url = "https://restcountries.eu/rest/v2/alpha/" . $_GET['countryCode'] ;
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
$result = curl_exec($ch);
curl_close($ch);



?>