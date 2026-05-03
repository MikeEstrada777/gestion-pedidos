const API = "http://localhost/gestion_pedidos/backend/api";

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) window.location.href = "login.html";

function cerrarSesion() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

function formatCOP(valor) {
    return "$" + parseFloat(valor).toLocaleString("es-CO");
}

document.addEventListener("DOMContentLoaded", cargarProductos);

// ── CARGAR PRODUCTOS ───────────────────────────────
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
                <td>${formatCOP(p.precio)}</td>
                <td>${p.stock}</td>
                <td>
                    <button onclick="abrirModal(${p.id_producto}, '${p.nombre}')"
                            class="btn btn-danger btn-sm">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join("");
    });
}

// ── MODAL PROPIO ───────────────────────────────────
let productoAEliminar = null;

function abrirModal(id, nombre) {
    productoAEliminar = id;

    document.getElementById("modal_desc").textContent =
        `Estás a punto de eliminar "${nombre}". Esta acción no se puede deshacer.`;
    document.getElementById("modal_advertencia").style.display = "none";

    // Verificar si tiene pedidos para mostrar advertencia
    fetch(`${API}/productos.php?accion=verificar&id=${id}`)
    .then(res => res.json())
    .then(data => {
        if (data.tiene_pedidos) {
            document.getElementById("modal_advertencia").style.display = "block";
        }
    })
    .catch(() => {})
    .finally(() => {
        document.getElementById("modalEliminar").classList.add("visible");
    });

    document.getElementById("btn_confirmar_eliminar").onclick = () => {
        cerrarModal();
        eliminarProducto(productoAEliminar);
    };
}

function cerrarModal() {
    document.getElementById("modalEliminar").classList.remove("visible");
}

// Cerrar modal si se hace clic fuera de la tarjeta
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("modalEliminar").addEventListener("click", function(e) {
        if (e.target === this) cerrarModal();
    });
});

// ── ELIMINAR PRODUCTO ──────────────────────────────
function eliminarProducto(id) {
    fetch(`${API}/productos.php?accion=eliminar&id=${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            mostrarAlerta("danger", data.error);
        } else {
            mostrarAlerta("success", "Producto eliminado correctamente");
            cargarProductos();
        }
    });
}

// ── CREAR PRODUCTO ─────────────────────────────────
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

// ── ALERTA ─────────────────────────────────────────
function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById("alerta");
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
    setTimeout(() => alerta.className = "d-none", 4000);
}