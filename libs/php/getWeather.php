<?php 
    $url = "api.openweathermap.org/data/2.5/forecast?q=" . $_GET['city'] . "&units=metric&appid=7f4064a1242b4915f014144b495d7b9c";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    $result = curl_exec($ch);
    curl_close($ch);
?>