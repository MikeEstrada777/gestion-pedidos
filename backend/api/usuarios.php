<?php
require_once "../config/db.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");

$metodo = $_SERVER["REQUEST_METHOD"];
$accion = $_GET["accion"] ?? "";

// ── REGISTRAR USUARIO ──────────────────────────────
if ($metodo === "POST" && $accion === "registrar") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $nombre    = $datos["nombre"]    ?? "";
    $correo    = $datos["correo"]    ?? "";
    $password  = $datos["password"]  ?? "";
    $rol       = $datos["rol"]       ?? "cliente";

    if (!$nombre || !$correo || !$password) {
        echo json_encode(["error" => "Todos los campos son obligatorios"]);
        exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $sql = "INSERT INTO usuarios (nombre, correo, contrasena, rol) 
            VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssss", $nombre, $correo, $hash, $rol);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Usuario registrado correctamente"]);
    } else {
        echo json_encode(["error" => "El correo ya está registrado"]);
    }
}

// ── INICIAR SESIÓN ─────────────────────────────────
if ($metodo === "POST" && $accion === "login") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $correo   = $datos["correo"]   ?? "";
    $password = $datos["password"] ?? "";

    $sql  = "SELECT * FROM usuarios WHERE correo = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $usuario   = $resultado->fetch_assoc();

    if ($usuario && password_verify($password, $usuario["contrasena"])) {
        unset($usuario["contrasena"]); // no enviar la contraseña
        echo json_encode([
            "mensaje" => "Login exitoso",
            "usuario" => $usuario
        ]);
    } else {
        echo json_encode(["error" => "Correo o contraseña incorrectos"]);
    }
}

// ── LISTAR USUARIOS (solo admin) ───────────────────
if ($metodo === "GET" && $accion === "listar") {
    $sql       = "SELECT id_usuario, nombre, correo, rol, fecha_registro 
                  FROM usuarios";
    $resultado = $conexion->query($sql);
    $usuarios  = $resultado->fetch_all(MYSQLI_ASSOC);
    echo json_encode($usuarios);
}
?>