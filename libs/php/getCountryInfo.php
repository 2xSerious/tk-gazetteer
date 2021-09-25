<?php
$url = "http://api.geonames.org/countryInfoJSON?formatted=true&lang=it&country=" . $_GET['countryCode'] . "&username=2xSerious&style=full";
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
$result = curl_exec($ch);
curl_close($ch);
