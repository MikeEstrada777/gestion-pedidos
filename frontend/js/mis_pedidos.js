const API = "http://localhost/gestion_pedidos/backend/api";

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) window.location.href = "login.html";
if (usuario.rol === "admin") window.location.href = "dashboard.html";

document.getElementById("nombre_cliente").textContent = "Hola, " + usuario.nombre;

function cerrarSesion() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", cargarMisPedidos);

function cargarMisPedidos() {
    fetch(`${API}/pedidos.php?accion=listar`)
    .then(res => res.json())
    .then(pedidos => {
        // Filtrar solo los pedidos del cliente actual
        const misPedidos = pedidos.filter(
            p => p.id_usuario == usuario.id_usuario
        );

        const tabla = document.getElementById("tabla_mis_pedidos");

        if (misPedidos.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        Aún no tienes pedidos. 
                        <a href="tienda.html">¡Haz tu primer pedido!</a>
                    </td>
                </tr>`;
            return;
        }

        tabla.innerHTML = misPedidos.map(p => `
            <tr>
                <td>${p.id_pedido}</td>
                <td>${new Date(p.fecha_pedido).toLocaleDateString()}</td>
                <td>$${parseFloat(p.total).toLocaleString()}</td>
                <td>${p.direccion_envio}</td>
                <td>
                    <span class="badge ${badgeEstado(p.estado)}">
                        ${p.estado}
                    </span>
                </td>
            </tr>
        `).join("");
    });
}

function badgeEstado(estado) {
    const colores = {
        "pendiente":  "bg-warning text-dark",
        "confirmado": "bg-info text-dark",
        "enviado":    "bg-primary",
        "entregado":  "bg-success",
        "cancelado":  "bg-danger"
    };
    return colores[estado] || "bg-secondary";
}