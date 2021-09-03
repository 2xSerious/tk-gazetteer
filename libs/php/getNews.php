<?php 
    $url = "https://newsdata.io/api/1/news?apikey=pub_10764cf934e55b7535bde00cdc2d6d9e2315&country=" . $_GET['countryCode'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    $result = curl_exec($ch);
    curl_close($ch);

?>