<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST,GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$mysqli = new mysqli('localhost', 'stanawgx_elysee', 'elyseeumukunzi@gmail.com', 'stanawgx_parking-app');
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => $mysqli->connect_error]);
    exit();
}

function getJsonInput()
{
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// -------------------------------------------------------------
// Mista.io SMS helper
// -------------------------------------------------------------
// IMPORTANT: store real API key securely (env var, .env, server config)

// Helper function to validate and format date
function validateDate($date, $format = 'Y-m-d')
{
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

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
            // return user id and token
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

    // save parking infomrmation
}

if ($endpoint === 'save_parking') {
    $data = getJsonInput();
    $user_id = $data['user_id'] ?? '';
    $plate_number = $data['plate_number'] ?? null;
    $location_id = $data['location_id'] ?? null;
    // Ensure we're getting the complete date in YYYY-MM-DD format
    $arrival_date = !empty($data['date']) ? date('Y-m-d', strtotime($data['date'])) : date('Y-m-d');
    $arrival_time = $data['arrival_time'] ?? date('H:i:s');
    $departure_date = !empty($data['departure_date']) ? date('Y-m-d', strtotime($data['departure_date'])) : null;
    $departure_time = $data['departure_time'] ?? null;
    $parking_status = $data['parking_status'] ?? 'active';
    $payment_status = $data['status'] ?? 'unpaid';
    $category_id = $data['category'] ?? null;
    $charges = $data['payment'];
    $phone = $data['phone'] ?? null;

    if (!$plate_number || !$location_id || !$arrival_date || !$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    // check if the plate is already registered
    $stmt = $mysqli->prepare('SELECT id FROM vehicles WHERE plate_number = ?');
    $stmt->bind_param('s', $plate_number);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $vehicle = $result->fetch_assoc();
        $vehicle_id = $vehicle['id'];
    } else {
        $insertVehicle = $mysqli->prepare('INSERT INTO vehicles (plate_number, phone, category_id, client_id) VALUES (?,?,?,?)');
        $insertVehicle->bind_param('ssii', $plate_number, $phone, $category_id, $user_id);
        $insertVehicle->execute();
        if (!$insertVehicle) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to register vehicle']);
            exit();
        }
        $vehicle_id = $insertVehicle->insert_id;
    }

    // Log the values being inserted for debugging
    error_log("Inserting parking record with date: " . $arrival_date . " and time: " . $arrival_time);
    
    // Prepare the SQL query with explicit date and time fields
    $query = "INSERT INTO parkings (
        vehicle_id, 
        location_id, 
        arrival_dates, 
        arrival_time, 
        departure_dates, 
        departure_time, 
        parking_status, 
        charges,
        user_id, 
        payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $insertParking = $mysqli->prepare($query);
    if (!$insertParking) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $mysqli->error]);
        exit();
    }
    
    // Ensure dates are properly formatted for MySQL
    $formatted_arrival_date = date('Y-m-d', strtotime($arrival_date));
    $formatted_departure_date = !empty($departure_date) ? date('Y-m-d', strtotime($departure_date)) : null;
    
    // Bind parameters with proper types
    $insertParking->bind_param(
        'iisssssdis', 
        $vehicle_id, 
        $location_id, 
        $formatted_arrival_date, 
        $arrival_time, 
        $formatted_departure_date, 
        $departure_time, 
        $parking_status, 
        $charges,
        $user_id, 
        $payment_status
    );
    
    if (!$insertParking->execute()) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save parking: ' . $insertParking->error]);
        exit();
    }

    if ($insertParking) {
        echo json_encode(['success' => true, 'message' => 'Parking registered successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to register parking']);
    }

    exit();
}

if ($endpoint === 'get_parking') {
    $plate = $_GET['plate_number'];

    if (empty($plate)) {
        http_response_code(400);
        echo json_encode(['error' => 'Plate number is required']);
        exit();
    }

    // Prepare and execute query
    $stmt = $mysqli->prepare('
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
    ');

    $stmt->bind_param('s', $plate);
    $stmt->execute();

    $result = $stmt->get_result();
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit();
}
if ($endpoint === 'remove_parking') {
    $data = getJsonInput();
    $plate = $data['plate_number'] ?? null;
    $phoneInput = $data['phone_number'] ?? null;
    $parkingStatus = $data['parking_status'];
    $paymentStatus = $data['payment_status'] ?? 'unpaid';
    $departureTime = $data['departure_time'] ?? date('H:i:s');

    $departureDate = date('Y-m-d');
    $parkingId = $data['parking_id'];

    $stmt = $mysqli->prepare('UPDATE parkings SET parking_status = ?, departure_time = ?, payment_status = ?  WHERE id = ?');
    $stmt->bind_param('ssis', $parkingStatus, $departureTime, $paymentStatus, $parkingId);
    $stmt->execute();
    // select the vehicle information relevant to parking and number then we send the SMS

    // Totals for that vehicle (paid vs unpaid)
    $totalsStmt = $mysqli->prepare('
        SELECT
            SUM(CASE WHEN p.payment_status = "paid" THEN p.charges ELSE 0 END)  AS paid_total,
            SUM(CASE WHEN p.payment_status = "unpaid" THEN p.charges ELSE 0 END) AS unpaid_total
        FROM parkings p
        JOIN vehicles v ON p.vehicle_id = v.id
        WHERE v.plate_number = ?
    ');
    $totalsStmt->bind_param('s', $plate);
    $totalsStmt->execute();
    $totalsRes = $totalsStmt->get_result();
    $paidTotal = 0;
    $unpaidTotal = 0;
    if ($totals = $totalsRes->fetch_assoc()) {
        $paidTotal = (float) $totals['paid_total'];
        $unpaidTotal = (float) $totals['unpaid_total'];
    }

    $stmt = $mysqli->prepare('SELECT phone, plate_number FROM vehicles WHERE plate_number = ?');
    $stmt->bind_param('s', $plate);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $phoneFromDb = $row['phone'];
    $phone = '250' . ltrim($phoneFromDb, '0');
    // If client provided phone_number, prefer it
    if ($phoneInput) {
        $clean = preg_replace('/[^0-9]/', '', $phoneInput);
        if (strpos($clean, '250') === 0) {
            $phone = $clean;
        } else {
            $phone = '250' . ltrim($clean, '0');
        }
    }
    $plateNumber = $row['plate_number'];

    if (!empty($phone)) {
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
            CURLOPT_POSTFIELDS => '{
    "recipient":"' . $phone . '",
    "sender_id":"E-Notifier",
    "type":"plain",
    "message": "Karibu muri MUSESU Ltd Parking Muhanga, Ikinyabiziga gifite ibirango' . $plate . ' Asigaye kwishyura ni ' . $unpaidTotal . ' uyu munsi' . $departureDate . 'Murakoze, Mugereyo Amahoro"
                      }',
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'Authorization: Bearer 729|yWtAFSxIgWMmre0UlJQ92aHRxv4LzFRCVB6A2BgU'
            ),
        ));
        $response = curl_exec($curl);
        curl_close($curl);
        echo $response . '' . $phone;
    }

    exit;
}

if ($endpoint === 'user_report') {
    $data = getJsonInput();
    $user_id = intval($data['user_id'] ?? 0);
    $from_date = $data['from_date'] ?? '';
    $to_date = $data['to_date'] ?? '';

    // Validate required fields
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        exit();
    }

    // Validate dates if provided
    if ($from_date && !validateDate($from_date)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid from_date format. Use YYYY-MM-DD']);
        exit();
    }

    if ($to_date && !validateDate($to_date)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid to_date format. Use YYYY-MM-DD']);
        exit();
    }

    // Build the query
    $query = "SELECT 
                p.id, 
                v.plate_number, 
                CONCAT(p.arrival_dates, ' ', p.arrival_time) as time_in, 
                CONCAT(p.departure_dates, ' ', p.departure_time) as time_out, 
                p.parking_status,
                p.payment_status,
                p.charges as amount_paid,
                u.name as user_name,
                l.location as parking_location
              FROM parkings p
              JOIN vehicles v ON p.vehicle_id = v.id
              JOIN users u ON v.client_id = u.id
              LEFT JOIN locations l ON p.location_id = l.id
              WHERE v.client_id = ?";

    $params = [];
    $types = 'i';  // i for integer (user_id)
    $params[] = &$user_id;

    // Add date range conditions if provided
    if ($from_date) {
        $query .= ' AND p.arrival_dates >= ?';
        $types .= 's';  // s for string (date)
        $params[] = &$from_date;
    }

    if ($to_date) {
        $query .= ' AND p.departure_dates <= ?';
        $types .= 's';  // s for string (date)
        $to_date_with_time = $to_date . ' 23:59:59';  // Include the entire end day
        $params[] = &$to_date_with_time;
    }

    $query .= ' ORDER BY p.arrival_dates DESC, p.arrival_time DESC';

    // Prepare and execute the statement
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $mysqli->error]);
        exit();
    }

    // Bind parameters
    if (count($params) > 0) {
        $stmt->bind_param($types, ...$params);
    }

    // Execute query
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch report data']);
        exit();
    }

    // Format the results
    $report_data = [];
    $total_entries = 0;
    $total_revenue = 0;
    $completed_entries = 0;
    $active_entries = 0;
    $paid_entries = 0;
    $unpaid_entries = 0;
    $paid_revenue = 0;
    $unpaid_revenue = 0;

    while ($row = $result->fetch_assoc()) {
        $report_data[] = [
            'id' => $row['id'],
            'plate_number' => $row['plate_number'],
            'time_in' => $row['time_in'],
            'time_out' => $row['time_out'],
            'parking_status' => $row['parking_status'],
            'payment_status' => $row['payment_status'],
            'amount_paid' => (float) $row['amount_paid'],
            'user_name' => $row['user_name'],
            'location' => $row['parking_location']
        ];

        $total_entries++;
        $total_revenue += (float) $row['amount_paid'];
        // Count stats
        if ($row['parking_status'] === 'completed' || $row['time_out']) {
            $completed_entries++;
        } else {
            $active_entries++;
        }
        if (strtolower($row['payment_status']) === 'paid') {
            $paid_entries++;
            $paid_revenue += (float) $row['amount_paid'];
        } else {
            $unpaid_entries++;
            $unpaid_revenue += (float) $row['amount_paid'];
        }
    }

    // Return the report data
    echo json_encode([
        'success' => true,
        'data' => $report_data,
        'summary' => [
            'total_entries' => $total_entries,
            'total_revenue' => $total_revenue,
            'completed_entries' => $completed_entries,
            'active_entries' => $active_entries,
            'paid_entries' => $paid_entries,
            'unpaid_entries' => $unpaid_entries,
            'paid_revenue' => $paid_revenue,
            'unpaid_revenue' => $unpaid_revenue,
            'date_range' => [
                'from' => $from_date,
                'to' => $to_date
            ]
        ]
    ]);
    exit();
}

if ($endpoint === 'list_users') {
    // Retrieve all users
    $result = $mysqli->query('SELECT id, name, email FROM users ORDER BY name ASC');
    if (!$result) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $mysqli->error]);
        exit();
    }

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email']
        ];
    }

    echo json_encode(['success' => true, 'data' => $users]);
    exit();
}

if ($endpoint === 'list_locations') {
    // Debug endpoint to list all locations
    $result = $mysqli->query('SELECT * FROM locations');
    if (!$result) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch locations: ' . $mysqli->error]);
        exit();
    }
    
    $locations = [];
    while ($row = $result->fetch_assoc()) {
        $locations[] = $row;
    }
    
    echo json_encode(['success' => true, 'locations' => $locations]);
    exit();
}

if ($endpoint === 'today_stats') {
    $data = getJsonInput();
    $user_id = intval($data['user_id'] ?? 0);
    $today = date('Y-m-d');

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        exit();
    }

    // Get today's stats
    $stmt = $mysqli->prepare('
        SELECT 
            COUNT(*) as total_entries,
            SUM(CASE WHEN p.payment_status = "paid" THEN 1 ELSE 0 END) as paid_entries,
            SUM(CASE WHEN p.payment_status = "unpaid" THEN 1 ELSE 0 END) as unpaid_entries,
            SUM(CASE WHEN p.payment_status = "paid" THEN p.charges ELSE 0 END) as total_revenue,
            SUM(CASE WHEN p.parking_status = "active" THEN 1 ELSE 0 END) as active_entries
        FROM parkings p
        JOIN vehicles v ON p.vehicle_id = v.id
        WHERE v.client_id = ? 
        AND DATE(p.arrival_dates) = ?
    ');

    $stmt->bind_param('is', $user_id, $today);
    $stmt->execute();
    $result = $stmt->get_result();
    $stats = $result->fetch_assoc();

    // Get busiest hour
    $hourStmt = $mysqli->prepare('
        SELECT 
            HOUR(arrival_time) as hour,
            COUNT(*) as count
        FROM parkings p
        JOIN vehicles v ON p.vehicle_id = v.id
        WHERE v.client_id = ? 
        AND DATE(arrival_dates) = ?
        GROUP BY HOUR(arrival_time)
        ORDER BY count DESC
        LIMIT 1
    ');

    $hourStmt->bind_param('is', $user_id, $today);
    $hourStmt->execute();
    $hourResult = $hourStmt->get_result();
    $busiestHour = 'N/A';

    if ($hourRow = $hourResult->fetch_assoc()) {
        $hour = intval($hourRow['hour']);
        $busiestHour = sprintf('%02d:00 - %02d:00', $hour, ($hour + 1) % 24);
    }

    // Get parking location stats
    $locationStmt = $mysqli->prepare('
        SELECT 
            l.location as name,
            COUNT(p.id) as total,
            SUM(CASE WHEN p.parking_status = "active" THEN 1 ELSE 0 END) as available
        FROM locations l
        LEFT JOIN parkings p ON l.id = p.location_id 
            AND DATE(p.arrival_dates) = ? 
            AND p.parking_status = "active"
        GROUP BY l.id, l.location
    ');

    $locationStmt->bind_param('s', $today);
    $locationStmt->execute();
    $locationResult = $locationStmt->get_result();
    $locations = [];

    while ($loc = $locationResult->fetch_assoc()) {
        $locations[] = [
            'name' => $loc['name'],
            'available' => intval($loc['available']),
            'total' => intval($loc['total'])
        ];
    }

    echo json_encode([
        'success' => true,
        'stats' => [
            'total_entries' => intval($stats['total_entries'] ?? 0),
            'paid_entries' => intval($stats['paid_entries'] ?? 0),
            'unpaid_entries' => intval($stats['unpaid_entries'] ?? 0),
            'total_revenue' => floatval($stats['total_revenue'] ?? 0),
            'active_entries' => intval($stats['active_entries'] ?? 0),
            'busiest_hour' => $busiestHour
        ],
        'locations' => $locations
    ]);
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
