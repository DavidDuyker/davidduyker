<?php
$url = 'http://davidduyker.com'; // URL of the homepage
$output_file = 'README.md'; // name of the output file

// Retrieve the HTML content of the URL
$html = file_get_contents($url);

// Parse the HTML to extract the content of the div with class 'content-flow'
$doc = new DOMDocument();
$doc->loadHTML($html);
$content_flow = $doc->getElementById('content-flow');
$markdown_content = $content_flow->nodeValue;

// Convert the content to markdown
$markdown = '# Homepage Content' . PHP_EOL . $markdown_content;

// Save the markdown to a file
file_put_contents($output_file, $markdown);
?>