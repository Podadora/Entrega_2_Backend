import { Router } from "express";
import FileManager from "../utils/filemanager.js";

const router = Router();
const cartsManager = new FileManager("data/carts.json");
const productsManager = new FileManager("data/products.json");

// Crear un nuevo carrito
router.post("/", async (req, res) => {
    try {
        const carts = await cartsManager.readFile();
        const newCart = {
            id: carts.length ? carts[carts.length - 1].id + 1 : 1,
            products: [],
        };

        carts.push(newCart);
        await cartsManager.writeFile(carts);
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el carrito" });
    }
});

// Obtener los productos de un carrito
router.get("/:cid", async (req, res) => {
    try {
        const carts = await cartsManager.readFile();
        const cart = carts.find(c => c.id === parseInt(req.params.cid));

        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
});

// Agregar un producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const carts = await cartsManager.readFile();
        const products = await productsManager.readFile();

        const cartIndex = carts.findIndex(c => c.id === parseInt(req.params.cid));
        if (cartIndex === -1) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        const product = products.find(p => p.id === parseInt(req.params.pid));
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const cart = carts[cartIndex];
        const productIndex = cart.products.findIndex(p => p.product === parseInt(req.params.pid));

        if (productIndex !== -1) {
            cart.products[productIndex].quantity++;
        } else {
            cart.products.push({ product: parseInt(req.params.pid), quantity: 1 });
        }

        await cartsManager.writeFile(carts);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: "Error al agregar el producto al carrito" });
    }
});

export default router;