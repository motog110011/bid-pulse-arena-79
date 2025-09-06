// Test del generador de productos dinámicos
import { generateProductVariant, generateBatchVariants } from './src/utils/dynamicAuctionGenerator.js';

console.log('🧪 Probando el Generador de Productos Dinámicos...\n');

const categories = ['Perfumes', 'Vinos y Licores', 'Electrónicos', 'Navajas', 'Relojes', 'Joyas'];

console.log('✅ Generando un producto por cada categoría:\n');

categories.forEach(category => {
  try {
    const product = generateProductVariant(category);
    console.log(`🏷️  ${category}:`);
    console.log(`   📦 ${product.title}`);
    console.log(`   💰 Precio inicial: $${product.startingBid}`);
    console.log(`   📝 ${product.description.substring(0, 80)}...`);
    console.log('');
  } catch (error) {
    console.log(`❌ Error generando producto de ${category}:`, error.message);
  }
});

console.log('✅ Generando lote de productos aleatorios:\n');

try {
  const batch = generateBatchVariants(5);
  batch.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} - $${product.startingBid}`);
  });
} catch (error) {
  console.log('❌ Error generando lote de productos:', error.message);
}

console.log('\n🎉 ¡Test del generador completado!');

// Test de condiciones específicas
console.log('\n✅ Probando condiciones específicas por categoría:');

const testConditions = () => {
  const results = {};
  
  // Generar 20 productos por categoría para ver la distribución de condiciones
  categories.forEach(category => {
    results[category] = [];
    for (let i = 0; i < 10; i++) {
      const product = generateProductVariant(category);
      const condition = product.title.split(' - ')[1];
      if (condition && !results[category].includes(condition)) {
        results[category].push(condition);
      }
    }
  });
  
  // Mostrar condiciones únicas por categoría
  Object.entries(results).forEach(([category, conditions]) => {
    console.log(`\n🏷️  ${category}:`);
    conditions.forEach(condition => {
      console.log(`   ✓ ${condition}`);
    });
  });
};

testConditions();
