const socket = io();

// Capturar elementos del DOM
const productList = document.getElementById("product-list");
const productForm = document.getElementById("product-form");
const deleteForm = document.getElementById("delete-form");

// Escuchar productos desde el servidor
socket.on("productList", (products) => {
    productList.innerHTML = ""; // Limpiar la lista
    products.forEach(product => {
        const li = document.createElement("li");
        li.textContent = `${product.id}: ${product.title} - $${product.price}`;
        productList.appendChild(li);
    });
});

// Enviar nuevo producto
productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const price = parseFloat(document.getElementById("price").value);
    
    if (!title || isNaN(price)) return alert("Completa todos los campos");

    socket.emit("newProduct", { title, price });

    productForm.reset();
});

// Eliminar producto
deleteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById("delete-id").value);
    
    if (isNaN(id)) return alert("Ingresa un ID válido");

    socket.emit("deleteProduct", id);

    deleteForm.reset();
});