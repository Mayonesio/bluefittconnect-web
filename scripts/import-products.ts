import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Define the structure of the product data in your JSON file
interface JsonProduct {
  code: string;
  gtin13?: string;
  name: string;
  tittle?: string; // Note: original JSON field name
  measure?: string;
  seotittle?: string; // Note: original JSON field name
  description: string;
  category: string;
  brand?: string;
  dimensionimage?: string; // Note: original JSON field name
  dimensiondata?: string; // Comma-separated string
  images?: string; // Comma-separated string
  imagerelated?: string; // Comma-separated string // Note: original JSON field name
}

// Define the structure of the product data for Firestore
// This should match your src/types/product.ts Product interface structure,
// but without the `id` (which will be the document ID) and with Timestamps.
interface FirestoreProduct {
  code: string;
  gtin13?: string;
  name: string;
  title?: string;
  measure?: string;
  seoTitle?: string;
  description: string;
  category: string;
  brand?: string;
  dimensionImage?: string;
  dimensionData?: string[]; // Changed to array of strings based on revised understanding
  images: string[];
  imagesRelated?: string[];
  price: number; // Added field
  stock: number; // Added field
  isActive: boolean; // Added field
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
  aiHint?: string;
}

function initializeFirebaseAdmin(serviceAccountPath: string): admin.firestore.Firestore {
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Error: Service account key file not found at ${serviceAccountPath}`);
    process.exit(1);
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require(path.resolve(serviceAccountPath));

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized.');
  }
  return admin.firestore();
}

function transformProduct(jsonProduct: JsonProduct): FirestoreProduct {
  const imagesArray = jsonProduct.images
    ? jsonProduct.images.split(',').map(img => img.trim()).filter(img => img)
    : [];
  const imagesRelatedArray = jsonProduct.imagerelated
    ? jsonProduct.imagerelated.split(',').map(img => img.trim()).filter(img => img)
    : [];
  
  // dimensiondata: "6 mm, 1/8\", 35 mm,24 mm,12 mm" -> ["6 mm", "1/8\"", "35 mm", "24 mm", "12 mm"]
  // This is a simplification. For a structured map, JSON needs to be [{label: "L", value: "35mm"}, ...]
  const dimensionDataArray = jsonProduct.dimensiondata
    ? jsonProduct.dimensiondata.split(',').map(d => d.trim()).filter(d => d)
    : [];

  return {
    code: jsonProduct.code,
    gtin13: jsonProduct.gtin13 || '', // Ensure optional fields are handled
    name: jsonProduct.name,
    title: jsonProduct.tittle || jsonProduct.name, // Use name as fallback for title
    measure: jsonProduct.measure || '',
    seoTitle: jsonProduct.seotittle || jsonProduct.name, // Use name as fallback
    description: jsonProduct.description,
    category: jsonProduct.category.toLowerCase(), // Normalize category
    brand: jsonProduct.brand || '',
    dimensionImage: jsonProduct.dimensionimage ? `images/productImage/${jsonProduct.dimensionimage.split('/').pop()}` : '', // Correct path
    dimensionData: dimensionDataArray,
    images: imagesArray.map(img => `images/productImage/${img.split('/').pop()}`), // Correct paths
    imagesRelated: imagesRelatedArray.map(img => `images/productImage/${img.split('/').pop()}`), // Correct paths
    price: 0, // Default price
    stock: 0, // Default stock
    isActive: true, // Default active state
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    aiHint: jsonProduct.category.toLowerCase(), // Simple AI hint from category
  };
}

async function importProducts(db: admin.firestore.Firestore, productsFilePath: string) {
  if (!fs.existsSync(productsFilePath)) {
    console.error(`Error: Products JSON file not found at ${productsFilePath}`);
    process.exit(1);
  }

  const productsJsonString = fs.readFileSync(productsFilePath, 'utf-8');
  const jsonProducts: JsonProduct[] = JSON.parse(productsJsonString);

  if (!Array.isArray(jsonProducts)) {
    console.error('Error: Products JSON file should contain an array of products.');
    process.exit(1);
  }

  console.log(`Found ${jsonProducts.length} products in JSON file.`);

  const productsCollection = db.collection('products');
  const batchSize = 400; // Firestore batch limit is 500 operations
  let batch = db.batch();
  let productsInBatch = 0;
  let totalProductsProcessed = 0;
  let successfulImports = 0;
  let failedImports = 0;

  for (const jsonProduct of jsonProducts) {
    if (!jsonProduct.code) {
      console.warn('Skipping product without a code:', jsonProduct.name || 'Unnamed Product');
      failedImports++;
      continue;
    }

    try {
      const firestoreProduct = transformProduct(jsonProduct);
      const docRef = productsCollection.doc(firestoreProduct.code); // Use product code as document ID
      batch.set(docRef, firestoreProduct);
      productsInBatch++;
      totalProductsProcessed++;

      if (productsInBatch >= batchSize) {
        console.log(`Committing batch of ${productsInBatch} products...`);
        await batch.commit();
        successfulImports += productsInBatch;
        batch = db.batch(); // Start a new batch
        productsInBatch = 0;
        console.log('Batch committed successfully.');
      }
    } catch (error) {
      console.error(`Error processing product with code ${jsonProduct.code}:`, error);
      failedImports++;
    }
  }

  // Commit any remaining products in the last batch
  if (productsInBatch > 0) {
    console.log(`Committing final batch of ${productsInBatch} products...`);
    try {
      await batch.commit();
      successfulImports += productsInBatch;
      console.log('Final batch committed successfully.');
    } catch (error) {
      console.error('Error committing final batch:', error);
      failedImports += productsInBatch; // Assume all in this failed batch did not import
    }
  }

  console.log('\n--- Import Summary ---');
  console.log(`Total products in JSON: ${jsonProducts.length}`);
  console.log(`Total products processed: ${totalProductsProcessed}`);
  console.log(`Successfully imported: ${successfulImports}`);
  console.log(`Failed to import/skipped: ${failedImports}`);
  console.log('----------------------\n');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: ts-node import-products.ts <path-to-service-account-key.json> <path-to-products.json>');
    process.exit(1);
  }

  const serviceAccountPath = args[0];
  const productsFilePath = args[1];

  console.log(`Using service account: ${serviceAccountPath}`);
  console.log(`Using products JSON: ${productsFilePath}`);

  const db = initializeFirebaseAdmin(serviceAccountPath);
  await importProducts(db, productsFilePath);
  console.log('Product import process finished.');
}

main().catch(error => {
  console.error('Unhandled error in main execution:', error);
  process.exit(1);
});
