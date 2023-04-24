<?php
$dropbox_url = 'https://www.dropbox.com/sh/87qg7860raqqeaf/AAAuDdu_6fNB3dg_HZje-VR4a?raw=1'; // Dropbox URL
$output_file = './dropbox.zip';

// Check if output directory is writable, if not set appropriate permissions
if (!is_writable(dirname($output_file))) {
    chmod(dirname($output_file), 0755);
}

// download the zip file
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $dropbox_url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$data = curl_exec($ch);
curl_close($ch);

// save the zip file to disk
file_put_contents($output_file, $data);

// extract the zip file contents
$zip = new ZipArchive;
$res = $zip->open($output_file);
if ($res === TRUE) {
    // iterate through the files in the archive and extract only the images
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
            $zip->extractTo('./', $filename);
        }
    }
    $zip->close();
    echo 'Zip file extracted successfully';
} else {
    echo 'Error: Could not open the zip file';
}
?>
