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
    exit;
}

// ── VERIFICAR SI TIENE PEDIDOS ─────────────────────
if ($metodo === "GET" && $accion === "verificar") {
    $id = intval($_GET["id"] ?? 0);
    $sql  = "SELECT COUNT(*) AS total FROM detalle_pedido WHERE id_producto = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $total = $stmt->get_result()->fetch_assoc()["total"];
    echo json_encode(["tiene_pedidos" => $total > 0, "total" => $total]);
    exit;
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

    $sql  = "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssdi", $nombre, $descripcion, $precio, $stock);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Producto creado correctamente"]);
    } else {
        echo json_encode(["error" => "Error al crear el producto"]);
    }
    exit;
}

// ── EDITAR PRODUCTO ────────────────────────────────
if ($metodo === "PUT" && $accion === "editar") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $id          = $datos["id_producto"]  ?? 0;
    $nombre      = $datos["nombre"]       ?? "";
    $descripcion = $datos["descripcion"]  ?? "";
    $precio      = $datos["precio"]       ?? 0;
    $stock       = $datos["stock"]        ?? 0;

    $sql  = "UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=? WHERE id_producto=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssdii", $nombre, $descripcion, $precio, $stock, $id);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Producto actualizado correctamente"]);
    } else {
        echo json_encode(["error" => "Error al actualizar el producto"]);
    }
    exit;
}

// ── ELIMINAR PRODUCTO ──────────────────────────────
if ($metodo === "DELETE" && $accion === "eliminar") {
    $id = intval($_GET["id"] ?? 0);

    if (!$id) {
        echo json_encode(["error" => "ID de producto inválido"]);
        exit;
    }

    $conexion->begin_transaction();

    try {
        // Eliminar primero de detalle_pedido si existe
        $sql_dp  = "DELETE FROM detalle_pedido WHERE id_producto = ?";
        $stmt_dp = $conexion->prepare($sql_dp);
        $stmt_dp->bind_param("i", $id);
        $stmt_dp->execute();

        // Eliminar el producto
        $sql_prod  = "DELETE FROM productos WHERE id_producto = ?";
        $stmt_prod = $conexion->prepare($sql_prod);
        $stmt_prod->bind_param("i", $id);
        $stmt_prod->execute();

        $conexion->commit();
        echo json_encode(["mensaje" => "Producto eliminado correctamente"]);

    } catch (Exception $e) {
        $conexion->rollback();
        echo json_encode(["error" => "Error al eliminar: " . $e->getMessage()]);
    }
    exit;
}
?>