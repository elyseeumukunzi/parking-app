<?php
$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.mista.io/sms',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "recipient":"250789817969",
    "sender_id":"E-Notifier",
    "type":"plain",
    "message":"Hello, this is a bulk SMS test"
}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json',
    'Authorization: Bearer 729|yWtAFSxIgWMmre0UlJQ92aHRxv4LzFRCVB6A2BgU'
  ),
));
$response = curl_exec($curl);
curl_close($curl);
echo $response;
