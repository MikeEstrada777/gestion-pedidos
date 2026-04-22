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
// ── VER PERFIL ─────────────────────────────────────
if ($metodo === "GET" && $accion === "perfil") {
    $id = $_GET["id"] ?? 0;

    $sql  = "SELECT id_usuario, nombre, correo, rol, fecha_registro 
             FROM usuarios WHERE id_usuario = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $usuario   = $resultado->fetch_assoc();

    if ($usuario) {
        echo json_encode($usuario);
    } else {
        echo json_encode(["error" => "Usuario no encontrado"]);
    }
}

// ── CAMBIAR CONTRASEÑA ──────────────────────────────
if ($metodo === "PUT" && $accion === "cambiar_password") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $id           = $datos["id_usuario"]    ?? 0;
    $password_old = $datos["password_old"]  ?? "";
    $password_new = $datos["password_new"]  ?? "";

    if (!$id || !$password_old || !$password_new) {
        echo json_encode(["error" => "Todos los campos son obligatorios"]);
        exit;
    }

    // Verificar contraseña actual
    $sql  = "SELECT contrasena FROM usuarios WHERE id_usuario = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $user      = $resultado->fetch_assoc();

    if (!password_verify($password_old, $user["contrasena"])) {
        echo json_encode(["error" => "La contraseña actual es incorrecta"]);
        exit;
    }

    $nuevo_hash = password_hash($password_new, PASSWORD_BCRYPT);
    $sql2  = "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?";
    $stmt2 = $conexion->prepare($sql2);
    $stmt2->bind_param("si", $nuevo_hash, $id);

    if ($stmt2->execute()) {
        echo json_encode(["mensaje" => "Contraseña actualizada correctamente"]);
    } else {
        echo json_encode(["error" => "Error al actualizar"]);
    }
}
?>