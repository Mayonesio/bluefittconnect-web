# Firebase Studio - Bluefitt Connect

Este es un proyecto inicial de NextJS en Firebase Studio para la aplicación Bluefitt Connect.

Para empezar, echa un vistazo a `src/app/page.tsx`.

## Ejecutando la Aplicación

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar Variables de Entorno de Firebase:**
    Asegúrate de tener un archivo `.env.local` en la raíz de tu proyecto con la configuración de tu proyecto de Firebase:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=1:your-app-id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-your-measurement-id (opcional)
    ```
3.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## Importando Productos a Firestore

Se proporciona un script para importar datos de productos desde un archivo JSON a tu colección `products` en Cloud Firestore.

**Prerrequisitos:**

1.  **Configuración del SDK de Administrador de Firebase:**
    *   El script utiliza `firebase-admin`, que debe estar listado en `devDependencies` en tu `package.json` raíz. Si no es así, instálalo:
        ```bash
        npm install --save-dev firebase-admin
        ```
    *   Necesitas un **archivo JSON de clave de cuenta de servicio** para tu proyecto de Firebase.
        *   Ve a la Configuración de tu Proyecto de Firebase en la Consola de Firebase.
        *   Navega a la pestaña "Cuentas de servicio".
        *   Haz clic en "Generar nueva clave privada" y descarga el archivo JSON.
        *   **Importante:** Mantén este archivo seguro y no lo subas a tu repositorio. Colócalo en una ubicación segura accesible por el script.

2.  **Archivo JSON de Datos de Productos:**
    *   Prepara tus datos de productos en un archivo JSON (ej. `products.json`). La estructura debe ser un array de objetos de producto o un objeto con una clave "products" que contenga el array. Consulta `scripts/products.sample.json` para ver un ejemplo del formato esperado.
    *   El script transformará las claves del JSON (`code`, `name`, `category`, `images` como cadena separada por comas, etc.) al modelo de datos de Firestore.
    *   Coloca este archivo JSON en una ubicación conocida, por ejemplo, dentro del directorio `scripts` o en cualquier otra parte accesible por el script.

3.  **Instalar `ts-node` (si no está ya instalado globalmente o como dev dependency en la raíz):**
    `ts-node` se utiliza para ejecutar archivos TypeScript directamente. Ya está incluido en los `devDependencies` del proyecto raíz.

**Ejecutando el Script de Importación (desde la raíz del proyecto):**

1.  **Abre tu terminal** en el directorio raíz del proyecto.
2.  **Ejecuta el script** utilizando el siguiente comando, reemplazando los marcadores de posición con las rutas reales a tus archivos:

    ```bash
    npm run import-products -- <ruta/a/tu-serviceAccountKey.json> <ruta/a/tu-products.json>
    ```
    O, si prefieres llamar a `ts-node` directamente:
    ```bash
    npx ts-node --project tsconfig.scripts.json scripts/import-products.ts <ruta/a/tu-serviceAccountKey.json> <ruta/a/tu-products.json>
    ```

    **Ejemplo:**
    Si tu clave de cuenta de servicio está en `~/Downloads/my-service-account.json` y tus datos de productos están en `scripts/my_full_catalog.json`:
    ```bash
    npm run import-products -- ~/Downloads/my-service-account.json scripts/my_full_catalog.json
    ```

    **Explicación de las Partes del Comando:**
    *   `npm run import-products --`: Utiliza el script npm definido en el `package.json` raíz. El `--` asegura que los argumentos subsiguientes se pasen al script mismo, no a npm.
    *   `npx ts-node`: Ejecuta `ts-node` usando la versión en `node_modules` del proyecto raíz.
    *   `--project tsconfig.scripts.json`: Le dice a `ts-node` que use la configuración específica de TypeScript para scripts (ubicada en la raíz del proyecto).
    *   `scripts/import-products.ts`: La ruta al script de importación, relativa a la raíz del proyecto.
    *   `<ruta/a/tu-serviceAccountKey.json>`: La **ruta absoluta o relativa** a tu archivo JSON de clave de cuenta de servicio de Firebase descargado.
    *   `<ruta/a/tu-products.json>`: La **ruta absoluta o relativa** a tu archivo JSON que contiene los datos de los productos.

3.  **Supervisar la Salida:**
    El script imprimirá mensajes de progreso en la consola, incluyendo:
    *   Estado de inicialización.
    *   El número de productos encontrados en tu archivo JSON.
    *   Progreso de las confirmaciones por lotes (batch commits) a Firestore.
    *   Cualquier error encontrado al procesar productos específicos.
    *   Un resumen final de productos importados y fallidos.

**Notas Importantes para el Script de Importación:**

*   **IDs de Documento:** El script utiliza el campo `code` de tu JSON como el ID de documento para cada producto en Firestore. Asegúrate de que los códigos de producto sean únicos para evitar sobrescribir documentos.
*   **Transformación de Datos:**
    *   Campos como `images`, `imagesRelated` (si están presentes como cadenas separadas por comas en el JSON) se convierten a arrays de cadenas, con rutas prefijadas `images/productImage/`.
    *   El campo `dimensiondata` de tu JSON se parsea intentando una estructura `[{label: string, value: string}]` si detecta el formato "Label: Value", o como un array de valores con etiquetas genéricas. Para datos de dimensión más estructurados y consistentes, es mejor que el JSON fuente ya los tenga como un array de objetos.
    *   Las rutas para `dimensionImage`, `images`, `imagesRelated` serán prefijadas con `images/productImage/` para coincidir con la estructura de tu directorio `public`, asumiendo que el JSON contiene solo los nombres de archivo (ej. `codotab.png`).
    *   `isActive` se establece a `true` por defecto.
    *   `price` y `stock` se establecen a `0` por defecto.
    *   `createdAt` y `updatedAt` se establecen utilizando los timestamps del servidor de Firestore.
*   **Escrituras por Lotes (Batch Writes):** El script utiliza escrituras por lotes de Firestore (tamaño de lote predeterminado de 400) para mayor eficiencia.
*   **Manejo de Errores:** El script incluye manejo básico de errores. Si un producto no se procesa correctamente, se registrará y el script intentará continuar.
*   **Idempotencia:** Si ejecutas el script varias veces con el mismo `products.json`, sobrescribirá los documentos existentes en Firestore si tienen el mismo `code` (ID de documento).

Después de ejecutar el script, verifica los datos en tu Consola de Firebase (sección Firestore Database) para asegurarte de que los productos se han importado correctamente.
