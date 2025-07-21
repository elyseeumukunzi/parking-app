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

function getJsonInput()
{
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
            //return user id and token
            echo json_encode(['token' => $token, 'user_id' => $row['id']]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit();

    //save parking infomrmation 

}

if ($endpoint === 'save_parking') {
    $data = getJsonInput();
    $user_id = $data['user_id'] ?? '';
    $plate_number = $data['plate_number'] ?? null;
    $location_id = $data['location_id'] ?? null;
    $arrival_date = $data['date'] ?? date('Y-m-d');
    $arrival_time = $data['arrival_time'] ?? null;
    $departure_date = $data['departure_date'] ?? null;
    $departure_time = $data['departure_time'] ?? null;
    $parking_status = $data['parking_status'] ?? 'active';
    $payment_status = $data['status'] ?? 'unpaid';
    $category_id = $data['category'] ?? null;
    $charges = $data['payment'];
    $phone = $data['phone'] ?? null;

    if (!$plate_number || !$location_id || !$arrival_date || !$user_id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit();
    }
    //check if the plate is already registered       
    $stmt = $mysqli->prepare("SELECT id FROM vehicles WHERE plate_number = ?");
    $stmt->bind_param("s", $plate_number);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $vehicle = $result->fetch_assoc();
        $vehicle_id = $vehicle['id'];
    } else {

        $insertVehicle = $mysqli->prepare("INSERT INTO vehicles (plate_number, phone, category_id, client_id ) VALUES (?,?,?,?)");
        $insertVehicle->execute(array($plate_number, $phone, $category_id, $user_id));
        if (!$insertVehicle) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to register vehicle"]);
            exit();
        }
        $vehicle_id = $insertVehicle->insert_id;

    }
    $insertParking = $mysqli->prepare("INSERT INTO parkings (vehicle_id, location_id, arrival_dates, arrival_time, departure_dates, departure_time, parking_status, charges, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $insertParking->execute(array($vehicle_id, $location_id, $arrival_date, $arrival_time, $departure_date, $departure_time, $parking_status, $charges, $payment_status));

    if ($insertParking) {
        echo json_encode(["success" => true, "message" => "Parking registered successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to register parking"]);
    }

    exit();


}

if ($endpoint === 'get_parking') {
    $plate = $_GET['plate_number'];

    if (empty($plate)) {
        http_response_code(400);
        echo json_encode(["error" => "Plate number is required"]);
        exit();
    }

    // Prepare and execute query
    $stmt = $mysqli->prepare("
        SELECT 
            p.id,
            v.plate_number,
            v.category_id,
            v.phone,
            p.arrival_dates,
            p.arrival_time,
            p.departure_dates,
            p.departure_time,
            p.parking_status,
            p.charges,
            p.payment_status,
            l.location
        FROM parkings p
        JOIN vehicles v ON p.vehicle_id = v.id
        LEFT JOIN locations l ON p.location_id = l.id
        WHERE v.plate_number = ?
        ORDER BY p.arrival_dates DESC, p.arrival_time DESC
    ");

    $stmt->bind_param("s", $plate);
    $stmt->execute();

    $result = $stmt->get_result();
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit();
}


http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
