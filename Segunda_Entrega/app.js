import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import productsRouter from "./routes/products.js";
import cartsRouter from "./routes/carts.js";
import FileManager from "./utils/filemanager.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Creacion server http y paso a IO
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public"));

// Middleware para interpretar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Instancia de FileManager para manejar los productos
const productManager = new FileManager("data/products.json");

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Ruta para la vista principal con Handlebars
app.get("/", async (req, res) => {
    const products = await productManager.readFile();
    res.render("home", { title: "Lista de Productos", products });
});

// Ruta para la vista en tiempo real
app.get("/realtimeproducts", async (req, res) => {
    res.render("realTimeProducts", { title: "Productos en Tiempo Real" });
});

// WebSockets
io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado");

    // Uso una función async para poder usar await
    const sendProductList = async () => {
        const products = await productManager.readFile();
        socket.emit("productList", products);
    };

    sendProductList(); // Llamamos la función

    // Escuchar evento de nuevo producto
    socket.on("newProduct", async (product) => {
        let products = await productManager.readFile();
        const newProduct = { 
            id: products.length ? products[products.length - 1].id + 1 : 1, 
            ...product 
        };
        products.push(newProduct);
        await productManager.writeFile(products);
        
        io.emit("productList", products);
    });

    // Escuchar evento de eliminación de producto
    socket.on("deleteProduct", async (id) => {
        let products = await productManager.readFile();
        products = products.filter(p => p.id !== id);
        await productManager.writeFile(products);

        io.emit("productList", products);
    });
});

// Inicia servidor con httpServer en lugar de app.listen
httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});