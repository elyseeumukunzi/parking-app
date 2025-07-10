<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$mysqli = new mysqli('localhost', 'root', '', 'parking-app');
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to connect to database']);
    exit();
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

if ($endpoint === 'register') {
    $data = getJsonInput();
    $name = $mysqli->real_escape_string($data['name'] ?? '');
    $email = $mysqli->real_escape_string($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (!$name || !$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing fields']);
        exit();
    }

    // Check if email exists
    $result = $mysqli->query("SELECT id FROM users WHERE email='$email'");
    if ($result && $result->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already registered']);
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $mysqli->query("INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$hashed_password')");
    if ($mysqli->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed']);
    }
    exit();
}

if ($endpoint === 'login') {
    $data = getJsonInput();
    $email = $mysqli->real_escape_string($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing fields']);
        exit();
    }

    $result = $mysqli->query("SELECT id, password FROM users WHERE email='$email'");
    if ($result && $row = $result->fetch_assoc()) {
        if (password_verify($password, $row['password'])) {
            // For demo, token is user_id + uniqid
            $token = base64_encode($row['id'] . ':' . uniqid());
            echo json_encode(['token' => $token]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
