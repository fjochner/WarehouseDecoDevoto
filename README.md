# 🏠 Deco Warehouse — Catálogo Web

Catálogo digital profesional para Instagram. Hecho en HTML, CSS y JavaScript vanilla.

---

## 📁 Estructura de archivos

```
deco-warehouse/
├── index.html          → Página principal con grilla de productos
├── producto.html       → Página de detalle de cada producto
├── style.css           → Todos los estilos y variables de diseño
├── app.js              → Lógica: catálogo, filtros, búsqueda, WhatsApp
├── productos.json      → Base de datos de productos (editá acá)
├── .vscode/
│   └── settings.json   → Configuración de VS Code + Live Server
└── README.md           → Este archivo
```

---

## 🚀 Cómo usar en VS Code

### 1. Instalá la extensión Live Server
- Abrí VS Code
- Ir a Extensiones (`Ctrl+Shift+X`)
- Buscar **"Live Server"** (autor: Ritwick Dey)
- Instalar

### 2. Abrí la carpeta del proyecto
- `Archivo → Abrir carpeta` → seleccioná la carpeta `deco-warehouse`

### 3. Lanzá el servidor
- Click derecho sobre `index.html`
- Seleccioná **"Open with Live Server"**
- Se abre en `http://127.0.0.1:5500`

> ⚠️ **Importante:** No abras los archivos directamente con doble click.
> El catálogo necesita un servidor local (Live Server) para cargar `productos.json`.

---

## ✏️ Cómo personalizar

### Cambiar productos
Editá `productos.json`. Cada producto tiene esta estructura:

```json
{
  "id": "producto-1",          ← Único, sin espacios
  "nombre": "Nombre del producto",
  "precio": 50000,             ← Número sin puntos ni $
  "categoria": "Categoría",
  "imagen": "https://...",     ← URL de imagen o ruta local (./img/foto.jpg)
  "descripcion": "Texto de descripción del producto."
}
```

### Cambiar colores
Abrí `style.css` y modificá las variables al inicio del archivo:

```css
--color-primary:  #2C2420;   /* Color oscuro principal */
--color-accent:   #C4975A;   /* Dorado / color de acento */
--color-bg:       #F7F5F2;   /* Fondo de la página */
```

### Cambiar nombre del negocio
Buscá `Deco Warehouse` en `index.html` y `producto.html` y reemplazalo.

### Cambiar número de WhatsApp
En `app.js`, línea 8:
```js
whatsappNumber: '5491161507530',
```

### Usar imágenes locales
Creá una carpeta `img/` dentro del proyecto y referenciá así en el JSON:
```json
"imagen": "./img/mi-producto.jpg"
```

---

## 📱 WhatsApp configurado
Número actual: **+54 9 11 6150 7530**

El botón de cada producto genera automáticamente el mensaje:
> *"Hola, quiero consultar por el producto [NOMBRE]"*

---

## 🎨 Tecnologías usadas
- HTML5 semántico
- CSS3 con variables custom
- JavaScript vanilla (sin frameworks)
- Google Fonts (Playfair Display + DM Sans)
- Sin dependencias externas

---

## 🌐 Cómo publicar (gratis)
Opciones recomendadas:
- **Netlify**: Arrastrá la carpeta a [netlify.com/drop](https://netlify.com/drop)
- **GitHub Pages**: Subí el repo y activá Pages en Settings
- **Vercel**: Conectá el repo de GitHub

---

*Desarrollado para Deco Warehouse · @deco.warehouse*
# WarehouseDecoDevoto
