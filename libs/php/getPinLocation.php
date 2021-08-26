<?php
    $url = "https://api.opencagedata.com/geocode/v1/json?q=" . $_GET['lat'] . "%2C+" . $_GET['lng'] . "&key=a4f098dd2af347f78d000688079649cf";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    $result = curl_exec($ch);
    curl_close($ch);

?>