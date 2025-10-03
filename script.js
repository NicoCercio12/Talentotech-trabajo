const API_URL = "http://localhost:8080/api";
let carrito = [];

// ----------- NAVEGACIÓN ENTRE SECCIONES ----------
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(sec => sec.classList.add('oculto'));
  document.getElementById(id).classList.remove('oculto');

  if (id === "productos") cargarProductos();
  if (id === "pedidos") cargarPedidos(1); // ejemplo: usuario ID = 1
  if (id === "carrito") renderCarrito();
}

// ----------- PRODUCTOS ----------
function cargarProductos() {
  fetch(`${API_URL}/productos`)
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("lista-productos");
      contenedor.innerHTML = "";
      data.forEach(prod => {
        const div = document.createElement("div");
        div.className = "producto";
        div.innerHTML = `
          <strong>${prod.nombre}</strong> - $${prod.precio} (Stock: ${prod.stock})
          <button onclick="agregarAlCarrito(${prod.id}, '${prod.nombre}', ${prod.precio})">Agregar</button>
        `;
        contenedor.appendChild(div);
      });
    });
}

// Crear producto
document.getElementById("form-producto").addEventListener("submit", e => {
  e.preventDefault();
  const producto = {
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    precio: parseFloat(document.getElementById("precio").value),
    categoria: document.getElementById("categoria").value,
    urlImagen: document.getElementById("urlImagen").value,
    stock: parseInt(document.getElementById("stock").value)
  };

  fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto)
  })
  .then(res => res.json())
  .then(() => {
    alert("Producto agregado!");
    cargarProductos();
  });
});

// ----------- CARRITO ----------
function agregarAlCarrito(id, nombre, precio) {
  const existente = carrito.find(p => p.id === id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }
  alert(`${nombre} agregado al carrito`);
}

function renderCarrito() {
  const contenedor = document.getElementById("lista-carrito");
  contenedor.innerHTML = "";
  carrito.forEach(item => {
    const div = document.createElement("div");
    div.className = "carrito-item";
    div.innerHTML = `${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}`;
    contenedor.appendChild(div);
  });
}

// Crear pedido
function realizarPedido() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const pedido = {
    lineas: carrito.map(item => ({
      producto: { id: item.id },
      cantidad: item.cantidad
    }))
  };

  fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  })
  .then(res => {
    if (!res.ok) return res.text().then(text => { throw new Error(text) });
    return res.json();
  })
  .then(data => {
    alert("Pedido creado con ID: " + data.id);
    carrito = [];
    mostrarSeccion('pedidos');
  })
  .catch(err => alert("Error: " + err.message));
}

// ----------- PEDIDOS ----------
function cargarPedidos(userId) {
  fetch(`${API_URL}/pedidos/usuario/${userId}`)
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("lista-pedidos");
      contenedor.innerHTML = "";
      data.forEach(ped => {
        const div = document.createElement("div");
        div.className = "pedido";
        div.innerHTML = `
          Pedido #${ped.id} - Estado: ${ped.estado} - Fecha: ${ped.fecha} <br>
          Total: $${ped.calcularTotal}
        `;
        contenedor.appendChild(div);
      });
    });
}

// Al cargar la página → mostrar productos
mostrarSeccion("productos");
