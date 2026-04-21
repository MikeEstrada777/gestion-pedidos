const API = "http://localhost/gestion_pedidos/backend/api";

// Verificar sesión
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) window.location.href = "login.html";

function cerrarSesion() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

// Cargar productos al abrir la página
document.addEventListener("DOMContentLoaded", cargarProductos);

function cargarProductos() {
    fetch(`${API}/productos.php?accion=listar`)
    .then(res => res.json())
    .then(productos => {
        const tabla = document.getElementById("tabla_productos");
        if (productos.length === 0) {
            tabla.innerHTML = `<tr>
                <td colspan="6" class="text-center">No hay productos aún</td>
            </tr>`;
            return;
        }
        tabla.innerHTML = productos.map(p => `
            <tr>
                <td>${p.id_producto}</td>
                <td>${p.nombre}</td>
                <td>${p.descripcion}</td>
                <td>$${parseFloat(p.precio).toLocaleString()}</td>
                <td>${p.stock}</td>
                <td>
                    <button onclick="eliminarProducto(${p.id_producto})" 
                            class="btn btn-danger btn-sm">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join("");
    });
}

function crearProducto() {
    const nombre      = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const precio      = document.getElementById("precio").value;
    const stock       = document.getElementById("stock").value;

    if (!nombre || !precio) {
        mostrarAlerta("warning", "Nombre y precio son obligatorios");
        return;
    }

    fetch(`${API}/productos.php?accion=crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, precio, stock })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            mostrarAlerta("danger", data.error);
        } else {
            mostrarAlerta("success", "Producto agregado correctamente");
            document.getElementById("nombre").value      = "";
            document.getElementById("descripcion").value = "";
            document.getElementById("precio").value      = "";
            document.getElementById("stock").value       = "";
            cargarProductos();
        }
    });
}

function eliminarProducto(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    fetch(`${API}/productos.php?accion=eliminar&id=${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        mostrarAlerta("success", "Producto eliminado");
        cargarProductos();
    });
}

function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById("alerta");
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
    setTimeout(() => alerta.className = "d-none", 3000);
}