#!/usr/bin/env node
/**
 * Script de seed — rellena la base con categorías y productos de ejemplo
 * usando la API REST (no toca la base de datos directamente, así que
 * funciona tanto contra el backend local como contra el desplegado).
 *
 * Uso:
 *   node scripts/seed.mjs
 *   API_URL=https://gestion-de-productos-three.vercel.app node scripts/seed.mjs
 *
 * Es idempotente: si corrés el script varias veces, no duplica categorías
 * ni productos que ya existan (los detecta por nombre y los salta).
 */

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const SEED_USER = {
  name: 'Seed Admin',
  email: 'seed@shopflow.test',
  password: 'Seed1234',
};

const CATEGORIES = [
  { name: 'Muebles', description: 'Sillas, mesas y muebles para el hogar' },
  { name: 'Decoración', description: 'Objetos decorativos para tu espacio' },
  { name: 'Cocina', description: 'Utensilios y accesorios de cocina' },
  { name: 'Electrónica', description: 'Gadgets y dispositivos electrónicos' },
  { name: 'Textiles', description: 'Telas, mantas y ropa de cama' },
];

const PRODUCTS = [
  // Muebles
  {
    name: 'Silla de Madera Minimalista',
    category: 'Muebles',
    description: 'Silla de roble macizo con líneas simples y acabado natural.',
    price: 149.0,
    stock: 24,
    imageSeed: 'silla-madera',
  },
  {
    name: 'Mesa de Centro Escandinava',
    category: 'Muebles',
    description: 'Mesa baja de madera clara, ideal para living.',
    price: 289.0,
    stock: 12,
    imageSeed: 'mesa-centro',
  },
  {
    name: 'Estantería Modular',
    category: 'Muebles',
    description: 'Estantería de 5 niveles, fácil de armar.',
    price: 199.5,
    stock: 18,
    imageSeed: 'estanteria',
  },
  // Decoración
  {
    name: 'Set de Jarrones Cerámicos',
    category: 'Decoración',
    description: 'Set de 3 jarrones de cerámica en distintos tamaños.',
    price: 45.5,
    stock: 40,
    imageSeed: 'jarrones',
  },
  {
    name: 'Espejo Redondo de Pared',
    category: 'Decoración',
    description: 'Espejo circular con marco de metal dorado, 60cm.',
    price: 79.0,
    stock: 15,
    imageSeed: 'espejo',
  },
  {
    name: 'Lámpara de Escritorio Minimalista',
    category: 'Decoración',
    description: 'Lámpara LED regulable con base de metal negro.',
    price: 59.99,
    stock: 30,
    imageSeed: 'lampara',
  },
  // Cocina
  {
    name: 'Set de Toallas de Algodón Orgánico',
    category: 'Cocina',
    description: 'Pack de 4 toallas de cocina 100% algodón orgánico.',
    price: 29.99,
    stock: 60,
    imageSeed: 'toallas-cocina',
  },
  {
    name: 'Cafetera de Filtro Manual',
    category: 'Cocina',
    description: 'Set de café de filtro manual, incluye jarra de vidrio.',
    price: 45.0,
    stock: 20,
    imageSeed: 'cafetera',
  },
  {
    name: 'Set de Especieros de Madera',
    category: 'Cocina',
    description: 'Organizador giratorio con 6 frascos de vidrio.',
    price: 65.0,
    stock: 22,
    imageSeed: 'especieros',
  },
  // Electrónica
  {
    name: 'Auriculares Inalámbricos con Cancelación de Ruido',
    category: 'Electrónica',
    description: 'Auriculares over-ear con Bluetooth 5.0 y 30hs de batería.',
    price: 299.99,
    stock: 8,
    imageSeed: 'auriculares',
  },
  {
    name: 'Altavoz Inteligente',
    category: 'Electrónica',
    description: 'Altavoz compacto con asistente de voz integrado.',
    price: 129.99,
    stock: 14,
    imageSeed: 'altavoz',
  },
  {
    name: 'Reloj Inteligente Deportivo',
    category: 'Electrónica',
    description: 'Smartwatch con monitor de frecuencia cardíaca y GPS.',
    price: 179.0,
    stock: 0,
    imageSeed: 'smartwatch',
  },
  // Textiles
  {
    name: 'Manta de Punto Gruesa',
    category: 'Textiles',
    description: 'Manta tejida a mano, 100% lana, 150x200cm.',
    price: 89.0,
    stock: 25,
    imageSeed: 'manta',
  },
  {
    name: 'Bolso Tote de Cuero',
    category: 'Textiles',
    description: 'Bolso espacioso de cuero genuino, ideal para el día a día.',
    price: 250.0,
    stock: 6,
    imageSeed: 'bolso-cuero',
  },
  {
    name: 'Set de Fundas de Almohada',
    category: 'Textiles',
    description: 'Pack de 2 fundas de algodón percal, varios colores.',
    price: 35.0,
    stock: 50,
    imageSeed: 'fundas',
  },
];

function imageUrl(seed, index) {
  return `https://picsum.photos/seed/${seed}-${index}/600/600`;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  return { status: response.status, ok: response.ok, body };
}

async function getAuthToken() {
  const register = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(SEED_USER),
  });

  if (register.ok) {
    console.log(`✓ Usuario de seed creado (${SEED_USER.email})`);
    return register.body.accessToken;
  }

  if (register.status === 409) {
    const login = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: SEED_USER.email, password: SEED_USER.password }),
    });

    if (!login.ok) {
      throw new Error(`No pude loguearme con el usuario de seed: ${JSON.stringify(login.body)}`);
    }

    console.log(`✓ Usuario de seed ya existía, inicié sesión (${SEED_USER.email})`);
    return login.body.accessToken;
  }

  throw new Error(`No pude crear el usuario de seed: ${JSON.stringify(register.body)}`);
}

async function ensureCategories(token) {
  const existing = await apiFetch('/categories');
  const byName = new Map(existing.body.map((category) => [category.name.toLowerCase(), category]));

  const result = new Map();

  for (const category of CATEGORIES) {
    const found = byName.get(category.name.toLowerCase());
    if (found) {
      result.set(category.name, found.id);
      console.log(`• Categoría "${category.name}" ya existía, la reutilizo`);
      continue;
    }

    const created = await apiFetch('/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(category),
    });

    if (!created.ok) {
      console.warn(`⚠ No pude crear la categoría "${category.name}": ${JSON.stringify(created.body)}`);
      continue;
    }

    result.set(category.name, created.body.id);
    console.log(`✓ Categoría creada: ${category.name}`);
  }

  return result;
}

async function ensureProducts(token, categoryIdsByName) {
  const existing = await apiFetch('/products?limit=100');
  const existingNames = new Set(existing.body.data.map((product) => product.name.toLowerCase()));

  let created = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    if (existingNames.has(product.name.toLowerCase())) {
      skipped += 1;
      console.log(`• Producto "${product.name}" ya existía, lo salteo`);
      continue;
    }

    const categoryId = categoryIdsByName.get(product.category);
    if (!categoryId) {
      console.warn(`⚠ No encontré la categoría "${product.category}" para "${product.name}", lo salteo`);
      continue;
    }

    const payload = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId,
      images: [imageUrl(product.imageSeed, 1), imageUrl(product.imageSeed, 2)],
    };

    const result = await apiFetch('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      console.warn(`⚠ No pude crear "${product.name}": ${JSON.stringify(result.body)}`);
      continue;
    }

    created += 1;
    console.log(`✓ Producto creado: ${product.name}`);
  }

  return { created, skipped };
}

async function main() {
  console.log(`Sembrando datos contra ${API_URL}\n`);

  const token = await getAuthToken();
  const categoryIdsByName = await ensureCategories(token);
  const { created, skipped } = await ensureProducts(token, categoryIdsByName);

  console.log('\nListo.');
  console.log(`Categorías disponibles: ${categoryIdsByName.size}`);
  console.log(`Productos creados: ${created} | ya existentes: ${skipped}`);
  console.log(`\nPodés loguearte en la app con:\n  email: ${SEED_USER.email}\n  password: ${SEED_USER.password}`);
}

main().catch((error) => {
  console.error('\n✗ El seed falló:', error.message);
  process.exit(1);
});
