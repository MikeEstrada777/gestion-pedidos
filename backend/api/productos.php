<?php
require_once "../config/db.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

$metodo = $_SERVER["REQUEST_METHOD"];
$accion = $_GET["accion"] ?? "";

// ── LISTAR PRODUCTOS ───────────────────────────────
if ($metodo === "GET" && $accion === "listar") {
    $sql       = "SELECT * FROM productos";
    $resultado = $conexion->query($sql);
    $productos = $resultado->fetch_all(MYSQLI_ASSOC);
    echo json_encode($productos);
}

// ── CREAR PRODUCTO ─────────────────────────────────
if ($metodo === "POST" && $accion === "crear") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $nombre      = $datos["nombre"]      ?? "";
    $descripcion = $datos["descripcion"] ?? "";
    $precio      = $datos["precio"]      ?? 0;
    $stock       = $datos["stock"]       ?? 0;

    if (!$nombre || !$precio) {
        echo json_encode(["error" => "Nombre y precio son obligatorios"]);
        exit;
    }

    $sql  = "INSERT INTO productos (nombre, descripcion, precio, stock) 
             VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssdi", $nombre, $descripcion, $precio, $stock);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Producto creado correctamente"]);
    } else {
        echo json_encode(["error" => "Error al crear el producto"]);
    }
}

// ── EDITAR PRODUCTO ────────────────────────────────
if ($metodo === "PUT" && $accion === "editar") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $id          = $datos["id_producto"]  ?? 0;
    $nombre      = $datos["nombre"]       ?? "";
    $descripcion = $datos["descripcion"]  ?? "";
    $precio      = $datos["precio"]       ?? 0;
    $stock       = $datos["stock"]        ?? 0;

    $sql  = "UPDATE productos 
             SET nombre=?, descripcion=?, precio=?, stock=? 
             WHERE id_producto=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssdii", $nombre, $descripcion, $precio, $stock, $id);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Producto actualizado correctamente"]);
    } else {
        echo json_encode(["error" => "Error al actualizar el producto"]);
    }
}

// ── ELIMINAR PRODUCTO ──────────────────────────────
if ($metodo === "DELETE" && $accion === "eliminar") {
    $id = $_GET["id"] ?? 0;

    $sql  = "DELETE FROM productos WHERE id_producto = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Producto eliminado correctamente"]);
    } else {
        echo json_encode(["error" => "Error al eliminar el producto"]);
    }
}
?>