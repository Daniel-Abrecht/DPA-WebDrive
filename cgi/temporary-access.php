<?php
  $mapping = getenv("MAPPING");
  if( !$mapping || !@$_GET['token'] ){
    http_response_code(403);
    echo "Missing token or mapping";
    exit(0);
  }
  $mapping = explode( ':', $mapping );
  $n = strlen($mapping[0]);
  $uri = urldecode(explode('?',$_SERVER['REQUEST_URI'],2)[0]);
  $b = substr( $uri, 0, $n );
  $loc = $mapping[1] . substr( $uri, $n );
  if( $b != $mapping[0] ){
    http_response_code(403);
    echo "Base url / Mapping mismatch";
    exit(0);
  }
  if( !file_exists( $loc ) ){
    http_response_code(404);
    echo "Not Found";
    exit(0);
  }
  if( is_dir( $loc ) ){
    http_response_code(403);
    echo "Is a direcory";
    exit(0);
  }
  $fs = stat($loc);
  $setag = sprintf('%x-%s', $fs['size'],substr(base_convert(str_pad($fs['mtime'],16,"0"),10,16),0,-6));
  $t = (int)(time() / 30);
  $tok1 = sha1($setag.'-'.$t);
  $tok2 = sha1($setag.'-'.($t+1));
  if( $_GET['token'] != $tok1 && $_GET['token'] != $tok2 ){
    http_response_code(403);
    echo "Invalid token";
    exit(0);
  }
  header('Content-Description: File Transfer');
  header('Content-Type: application/octet-stream');
  header('Content-Disposition: attachment; filename="'.basename($loc).'"');
  header('Expires: 0');
  header('Cache-Control: must-revalidate');
  header('Content-Length: ' . filesize($loc));
  readfile($loc);
  exit(0);
?>
