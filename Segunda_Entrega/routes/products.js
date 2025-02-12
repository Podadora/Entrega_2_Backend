import { Router } from "express";
import FileManager from "../utils/filemanager.js";

const router = Router();
const productManager = new FileManager("data/products.json");

// Obtener todos los productos (GET /api/products)
router.get("/", async (req, res) => {
    try {
        const products = await productManager.readFile();
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const response = limit ? products.slice(0, limit) : products;
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// Obtener un producto por ID (GET /api/products/:pid)
router.get("/:pid", async (req, res) => {
    try {
        const products = await productManager.readFile();
        const product = products.find(p => p.id === parseInt(req.params.pid));
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});

// Agregar un nuevo producto (POST /api/products)
router.post("/", async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        // Verificar que se hayan ingresado todos los campos
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        // Crear plantilla de producto
        const products = await productManager.readFile();
        const newProduct = {
            id: products.length ? products[products.length - 1].id + 1 : 1,
            title,
            description,
            code,
            price,
            stock,
            category,
            status: true,
        };

        // Verificar si el código ya existe (evitar productos duplicados)
        if (products.some(p => p.code === code)) {
            return res.status(400).json({ error: "Código de producto ya existente" });
        }

        products.push(newProduct);
        await productManager.writeFile(products);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al agregar el producto" });
    }
});

// Actualizar un producto por ID (PUT /api/products/:pid)
router.put("/:pid", async (req, res) => {
    try {
        const products = await productManager.readFile();
        const index = products.findIndex(p => p.id === parseInt(req.params.pid));

        if (index === -1) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Evitar que el usuario modifique el ID
        const updatedProduct = { ...products[index], ...req.body, id: products[index].id };
        products[index] = updatedProduct;

        await productManager.writeFile(products);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// Eliminar un producto por ID (DELETE /api/products/:pid)
router.delete("/:pid", async (req, res) => {
    try {
        let products = await productManager.readFile();
        const filteredProducts = products.filter(p => p.id !== parseInt(req.params.pid));

        if (products.length === filteredProducts.length) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        await productManager.writeFile(filteredProducts);
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

export default router;