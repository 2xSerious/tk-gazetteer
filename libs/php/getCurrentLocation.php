<?php 
 $url = "http://api.geonames.org/countryCode?type=JSON&lat=" . $_GET['lat'] . "&lng=" . $_GET['lng'] . "&username=2xserious";

 $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
 $result = curl_exec($ch);
 curl_close($ch);

?>