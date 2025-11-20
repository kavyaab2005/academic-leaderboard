<?php
header('Content-Type: application/json');
session_start();
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
// adjust script path
$base = '/leaderboard_api/api.php';
$path = substr($uri, strlen($base));
$parts = array_values(array_filter(explode('/',$path)));

$mysqli = new mysqli('localhost','root','','leaderboard');
if($mysqli->connect_errno){ http_response_code(500); echo json_encode(['message'=>'DB error']); exit; }

function respond($d){ echo json_encode($d); exit; }

if($parts[0] === 'admin' && $parts[1] === 'login' && $method === 'POST'){
  $data = json_decode(file_get_contents('php://input'), true);
  $email = $mysqli->real_escape_string($data['email']);
  $pw = $data['password'];
  $res = $mysqli->query("SELECT id,password FROM admins WHERE email='$email' LIMIT 1");
  if($res && $res->num_rows){
    $row = $res->fetch_assoc();
    if(password_verify($pw, $row['password'])){
      // issue simple token (insecure demo) - better use JWT
      $token = bin2hex(random_bytes(16));
      $_SESSION['admin_token'] = $token;
      respond(['token'=>$token]);
    }
  }
  http_response_code(401); respond(['message'=>'Invalid credentials']);
}

/* auth helper */
function isAdmin(){
  return isset($_SESSION['admin_token']);
}

/* Students */
if($parts[0] === 'students'){
  if($method === 'GET'){
    $r = $GLOBALS['mysqli']->query("SELECT * FROM students");
    $out = [];
    while($row = $r->fetch_assoc()) $out[] = $row;
    respond($out);
  }
  if($method === 'POST'){
    if(!isAdmin()){ http_response_code(401); respond(['message'=>'unauthorized']); }
    $d = json_decode(file_get_contents('php://input'), true);
    $name = $GLOBALS['mysqli']->real_escape_string($d['name']);
    $cls = $GLOBALS['mysqli']->real_escape_string($d['class']);
    $GLOBALS['mysqli']->query("INSERT INTO students (name,class) VALUES ('$name','$cls')");
    respond(['ok'=>true]);
  }
  if($method === 'DELETE' && isset($parts[1])){
    if(!isAdmin()){ http_response_code(401); respond(['message'=>'unauthorized']); }
    $id = intval($parts[1]);
    $GLOBALS['mysqli']->query("DELETE FROM students WHERE id=$id");
    respond(['ok'=>true]);
  }
}

/* Leaderboard */
if($parts[0] === 'leaderboard'){
  if($method === 'GET'){
    $r = $GLOBALS['mysqli']->query("SELECT * FROM leaderboard ORDER BY score DESC");
    $out=[];
    while($row=$r->fetch_assoc()) $out[]=$row;
    respond($out);
  }
  if($method === 'POST'){
    if(!isAdmin()){ http_response_code(401); respond(['message'=>'unauthorized']); }
    $d = json_decode(file_get_contents('php://input'), true);
    $name = $GLOBALS['mysqli']->real_escape_string($d['name']);
    $score = intval($d['score']);
    $GLOBALS['mysqli']->query("INSERT INTO leaderboard (name,score) VALUES ('$name',$score)");
    respond(['ok'=>true]);
  }
  if($method === 'DELETE' && isset($parts[1])){
    if(!isAdmin()){ http_response_code(401); respond(['message'=>'unauthorized']); }
    $id = intval($parts[1]);
    $GLOBALS['mysqli']->query("DELETE FROM leaderboard WHERE id=$id");
    respond(['ok'=>true]);
  }
}

/* Studymaterials simple listing */
if($parts[0] === 'studymaterials'){
  if($method === 'GET'){
    $r = $GLOBALS['mysqli']->query("SELECT * FROM studymaterials ORDER BY created_at DESC");
    $out=[]; while($row=$r->fetch_assoc()) $out[]=$row; respond($out);
  }
  if($method === 'POST'){ /* file upload omitted for brevity - accept JSON with url */ if(!isAdmin()){ http_response_code(401); respond(['message'=>'unauthorized']); } $d=json_decode(file_get_contents('php://input'),true); $title=$GLOBALS['mysqli']->real_escape_string($d['title']); $url=$GLOBALS['mysqli']->real_escape_string($d['url']); $GLOBALS['mysqli']->query("INSERT INTO studymaterials (title,url) VALUES ('$title','$url')"); respond(['ok'=>true]); }
  if($method === 'DELETE' && isset($parts[1])){ if(!isAdmin()){ http_response_code(401); respond(['message'=>'unauthorized']); } $id=intval($parts[1]); $GLOBALS['mysqli']->query("DELETE FROM studymaterials WHERE id=$id"); respond(['ok'=>true]); }
}

/* Gallery simple */
if($parts[0] === 'gallery'){
  if($method === 'GET'){ $r=$GLOBALS['mysqli']->query("SELECT * FROM gallery ORDER BY created_at DESC"); $out=[]; while($row=$r->fetch_assoc()) $out[]=$row; respond($out); }
  if($method === 'POST'){ if(!isAdmin()){ http_response_code(401); respond(['message'=>'unauthorized']); } $d=json_decode(file_get_contents('php://input'),true); $url=$GLOBALS['mysqli']->real_escape_string($d['url']); $caption=$GLOBALS['mysqli']->real_escape_string($d['caption']); $GLOBALS['mysqli']->query("INSERT INTO gallery (url,caption) VALUES ('$url','$caption')"); respond(['ok'=>true]); }
  if($method === 'DELETE' && isset($parts[1])){ if(!isAdmin()){ http_response_code(401); respond(['message'=>'unauthorized']); } $id=intval($parts[1]); $GLOBALS['mysqli']->query("DELETE FROM gallery WHERE id=$id"); respond(['ok'=>true]); }
}

/* Dashboard stats */
if($parts[0] === 'dashboard' && $parts[1] === 'stats'){
  $r1 = $mysqli->query("SELECT COUNT(*) c FROM leaderboard")->fetch_assoc()['c'];
  $r2 = $mysqli->query("SELECT COUNT(*) c FROM studymaterials")->fetch_assoc()['c'];
  $r3 = $mysqli->query("SELECT COUNT(*) c FROM gallery")->fetch_assoc()['c'];
  respond(['top'=>intval($r1),'materials'=>intval($r2),'gallery'=>intval($r3)]);
}

http_response_code(404); echo json_encode(['message'=>'unknown route']);
