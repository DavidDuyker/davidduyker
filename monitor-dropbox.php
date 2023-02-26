<?php

$dropbox_url = 'https://www.dropbox.com/sh/87qg7860raqqeaf/AAAuDdu_6fNB3dg_HZje-VR4a?dl=1'; // replace with your Dropbox URL
$output_dir = '../liveimage'; // replace with the directory where you want to save the extracted image

// download the zip file
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $dropbox_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$data = curl_exec($ch);
curl_close($ch);
echo 'Downloaded data: ' . $data . "\n";

// save the zip file to disk
$temp_file = tempnam(sys_get_temp_dir(), 'dropbox_zip');
echo 'Temporary file path: ' . $temp_file . "\n";
file_put_contents($temp_file, $data);
echo 'Saved data to file: ' . file_get_contents($temp_file) . "\n";

// extract the contents of the zip file
$zip = new ZipArchive;
$res = $zip->open($temp_file);
if ($res === TRUE) {
    $zip->extractTo($output_dir);
    $zip->close();
    echo 'Zip file extracted successfully';
} else {
    echo 'Failed to extract zip file';
}

// delete the temporary zip file
unlink($temp_file);

?>
