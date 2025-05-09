# Firebase Studio - Blufitt Connect

This is a NextJS starter in Firebase Studio for the Blufitt Connect application.

To get started, take a look at `src/app/page.tsx`.

## Running the Application

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Firebase Environment Variables:**
    Ensure you have a `.env.local` file in the root of your project with your Firebase project configuration:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=1:your-app-id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-your-measurement-id (optional)
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Importing Products into Firestore

A script is provided to import product data from a JSON file into your Cloud Firestore `products` collection.

**Prerequisites:**

1.  **Firebase Admin SDK Setup:**
    *   The script uses `firebase-admin` which should be listed in `devDependencies` in your `package.json`. If not, install it:
        ```bash
        npm install --save-dev firebase-admin
        ```
    *   You need a **service account key JSON file** for your Firebase project.
        *   Go to your Firebase Project Settings in the Firebase Console.
        *   Navigate to the "Service accounts" tab.
        *   Click on "Generate new private key" and download the JSON file.
        *   **Important:** Keep this file secure and do not commit it to your repository. Place it in a safe location accessible by the script.

2.  **Product Data JSON File:**
    *   Prepare your product data in a JSON file (e.g., `products.json`). The structure should be an array of product objects. See `scripts/products.sample.json` for an example of the expected format for each product from your source JSON.
    *   The script assumes keys like `code`, `name`, `category`, `images` (as a comma-separated string), etc. It will transform these into the Firestore data model.
    *   Place this JSON file in a known location, for example, inside the `scripts` directory.

3.  **Install `ts-node` (if not already installed globally or as a dev dependency):**
    `ts-node` is used to execute TypeScript files directly. It's already included in the project's `devDependencies`.

**Running the Import Script:**

1.  **Open your terminal** in the root directory of the project.
2.  **Execute the script** using the following command, replacing the placeholders with the actual paths to your files:

    ```bash
    npm run import-products -- <path/to/your-serviceAccountKey.json> <path/to/your-products.json>
    ```
    Or, if you prefer to call `ts-node` directly:
    ```bash
    npx ts-node --project tsconfig.scripts.json scripts/import-products.ts <path/to/your-serviceAccountKey.json> <path/to/your-products.json>
    ```

    **Example:**
    If your service account key is at `~/Downloads/my-service-account.json` and your products data is at `scripts/my_full_catalog.json`:
    ```bash
    npm run import-products -- ~/Downloads/my-service-account.json scripts/my_full_catalog.json
    ```

    **Explanation of Command Parts:**
    *   `npm run import-products --`: Uses the npm script defined in `package.json`. The `--` ensures subsequent arguments are passed to the script itself, not to npm.
    *   `npx ts-node`: Executes `ts-node`.
    *   `--project tsconfig.scripts.json`: Tells `ts-node` to use the specific TypeScript configuration for scripts.
    *   `scripts/import-products.ts`: The path to the import script.
    *   `<path/to/your-serviceAccountKey.json>`: The **absolute or relative path** to your downloaded Firebase service account key JSON file.
    *   `<path/to/your-products.json>`: The **absolute or relative path** to your JSON file containing the product data.

3.  **Monitor the Output:**
    The script will print progress messages to the console, including:
    *   Initialization status.
    *   The number of products found in your JSON file.
    *   Progress of batch commits to Firestore.
    *   Any errors encountered while processing specific products.
    *   A final summary of imported and failed products.

**Important Notes for the Import Script:**

*   **Document IDs:** The script uses the `code` field from your JSON as the document ID for each product in Firestore. Ensure product codes are unique to avoid overwriting documents.
*   **Data Transformation:**
    *   Fields like `images`, `imagesRelated` (if present as comma-separated strings in JSON) are converted to arrays of strings.
    *   The `dimensiondata` field from your JSON (e.g., `"6 mm, 1/8\", 35 mm,24 mm,12 mm"`) will be split by commas and stored as an array of strings (e.g., `["6 mm", "1/8\"", "35 mm", "24 mm", "12 mm"]`). For a more structured `dimensionData` (like an array of maps: `[{label: "Length", value: "10cm"}, ...]`), your source JSON would need to be structured accordingly. The script currently implements the simpler string array transformation.
    *   Paths for `dimensionImage`, `images`, `imagesRelated` will be prefixed with `images/productImage/` to match your `public` directory structure, assuming the JSON contains only the filenames (e.g., `codotab.png`).
    *   `isActive` is set to `true` by default.
    *   `price` and `stock` are set to `0` by default.
    *   `createdAt` and `updatedAt` are set using Firestore server timestamps.
*   **Batch Writes:** The script uses Firestore batch writes (default batch size of 400) for efficiency. This helps in importing large datasets without hitting rate limits as easily.
*   **Error Handling:** The script includes basic error handling. If a product fails to process, it will be logged, and the script will attempt to continue with the next products.
*   **Idempotency:** If you run the script multiple times with the same `products.json`, it will overwrite existing documents in Firestore if they have the same `code` (document ID).

After running the script, verify the data in your Firebase Console (Firestore Database section) to ensure the products have been imported correctly.
