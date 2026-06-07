const admin = require("firebase-admin");
const fs = require("fs");

// Tu archivo de credenciales de Firebase
const serviceAccount = require("./recuento-stock-mp-firebase-adminsdk-fbsvc-7222a13751.json");

// Inicializamos la app con los permisos del JSON
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportarColeccion() {
  try {
    console.log(
      "🔄 Conectando directamente con Firebase Firestore (SDK Oficial)...",
    );

    // Apuntamos a la colección 'products'
    const snapshot = await db.collection("products").get();

    if (snapshot.empty) {
      console.log(
        '⚠️ No se encontraron documentos en la colección "products".',
      );
      return;
    }

    console.log(`📦 Extrayendo ${snapshot.size} productos...`);
    const productos = [];

    // Recorremos los documentos y los metemos en un array plano
    snapshot.forEach((doc) => {
      productos.push({
        id: doc.id, // Conservamos el ID de Firebase que necesitas
        ...doc.data(), // Añadimos todos los campos internos (descripción, stock, etc.)
      });
    });

    // Guardamos el archivo final formateado como JSON
    fs.writeFileSync(
      "./productos.json",
      JSON.stringify(productos, null, 2),
      "utf-8",
    );

    console.log(
      '✅ ¡Éxito absoluto! "productos.json" se ha generado en tu carpeta.',
    );
  } catch (error) {
    console.error("❌ Error crítico al extraer los datos:", error);
  } finally {
    // Cerramos la conexión para que la consola termine el proceso limpiamente
    process.exit();
  }
}

exportarColeccion();
