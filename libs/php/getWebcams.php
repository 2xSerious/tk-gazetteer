<?php 
    $url = "https://api.windy.com/api/webcams/v2/list/country=" . $_GET['countrCode'] . "?key=dEWH5yyIoVTSyA8xEiL1dLln7KdIZsgi&show=webcams:image,location,player" ;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    $result = curl_exec($ch);
    curl_close($ch);
?>