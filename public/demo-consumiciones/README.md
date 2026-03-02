# Consumiciones demo (Coca-Cola y Pancho)

Para que el evento demo use **tus fotos** de Coca y Pancho:

1. Copiá en esta carpeta dos imágenes con nombres que contengan **"coca"** y **"pancho"** (por ejemplo `coca.png` y `pancho.png`), o cualquier archivo .png/.jpg que tenga esas palabras en el nombre.

2. En el backend tené configurado Cloudinary en el `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

3. Ejecutá desde la carpeta del backend:
   ```bash
   npm run seed-demo
   ```
   El script sube las fotos a Cloudinary y las asocia a las consumiciones demo.

Si no hay imágenes aquí o Cloudinary no está configurado, el seed usa imágenes de ejemplo de Unsplash y todo funciona igual.
