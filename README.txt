 📝 Task API

Una API REST simple para gestionar tareas (**To-Do List**) construida con **Node.js + Express + TypeScript**.

---

 📦 Scripts NPM

En tu `package.json` deben estar definidos los siguientes scripts:

```json
"scripts": {
  "dev": "ts-node src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

- `npm run dev` → corre el proyecto en modo desarrollo con **ts-node**.  
- `npm run build` → compila TypeScript a JavaScript en la carpeta `dist/`.  
- `npm start` → corre la versión compilada en producción.  

---

 ⚙️ Instalación y ejecución

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repo>
   cd task-api
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Correr en desarrollo**
   ```bash
   npm run dev
   ```
   Servidor disponible en: [http://localhost:3000](http://localhost:3000)

4. **Compilar y ejecutar en producción**
   ```bash
   npm run build
   npm start
   ```

---

## 📌 Endpoints de la API

### 1. Crear una tarea
**POST** `/tasks`

- **Request (JSON):**
  ```json
  {
    "title": "Comprar leche"
  }
  ```

- **Response (201):**
  ```json
  {
    "id": "uuid",
    "title": "Comprar leche",
    "completed": false,
    "createdAt": "2025-09-10T12:34:56.789Z"
  }
  ```

- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Comprar leche"}'
  ```

---

### 2. Listar todas las tareas
**GET** `/tasks`

- **Response (200):**
  ```json
  [
    {
      "id": "uuid",
      "title": "Comprar leche",
      "completed": false,
      "createdAt": "2025-09-10T12:34:56.789Z"
    }
  ]
  ```

- **cURL:**
  ```bash
  curl http://localhost:3000/tasks
  ```

---

### 3. Obtener una tarea por ID
**GET** `/tasks/:id`

- **Response (200):**
  ```json
  {
    "id": "uuid",
    "title": "Comprar leche",
    "completed": false,
    "createdAt": "2025-09-10T12:34:56.789Z"
  }
  ```

- **cURL:**
  ```bash
  curl http://localhost:3000/tasks/<id>
  ```

---

### 4. Actualizar una tarea
**PATCH** `/tasks/:id`

- **Request (JSON):**
  ```json
  {
    "completed": true
  }
  ```

- **Response (200):**
  ```json
  {
    "id": "uuid",
    "title": "Comprar leche",
    "completed": true,
    "createdAt": "2025-09-10T12:34:56.789Z"
  }
  ```

- **cURL:**
  ```bash
  curl -X PATCH http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
  ```

---

### 5. Eliminar una tarea
**DELETE** `/tasks/:id`

- **Response (204):** (sin contenido)

- **cURL:**
  ```bash
  curl -X DELETE http://localhost:3000/tasks/<id>
  ```

---

## 🛠️ Requisitos

- **Node.js** v18 o superior  
- **npm** v9 o superior  

---

## 🚀 Futuras mejoras

- Persistencia de tareas en archivo JSON o base de datos  
- Autenticación de usuarios  
- Despliegue en servicios como Heroku, Render o Railway  
