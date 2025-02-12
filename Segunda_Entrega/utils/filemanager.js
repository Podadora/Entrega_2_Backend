import { promises as fs } from "fs";

class FileManager {
    constructor(filePath) {
        this.filePath = filePath;
    }

        // Verifica si el archivo existe; si no, lo crea vacio
    async checkFile() {
        try {
            await fs.access(this.filePath);
        } catch {
            await fs.writeFile(this.filePath, "[]");
        }
    }

    // Método para leer el archivo JSON
    async readFile() {
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error leyendo ${this.filePath}:`, error);
            return []; // Si hay error, retorna un array vacío
        }
    }

    // Método para escribir en el archivo JSON
    async writeFile(data) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error escribiendo en ${this.filePath}:`, error);
        }
    }
}

export default FileManager;