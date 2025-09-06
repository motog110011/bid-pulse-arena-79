// Script para probar la función admin_update_user_balance desde la consola del navegador
// Ejecutar esto SOLO en la consola de desarrollador del navegador cuando estés logueado como admin

// Paso 1: Verificar que tienes acceso a supabase y que eres admin
async function checkAdminAccess() {
  console.log('🔍 Verificando acceso de administrador...');
  
  // Verificar si supabase está disponible
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase no está disponible. Asegúrate de estar en la página correcta.');
    return false;
  }

  try {
    // Obtener usuario actual
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error obteniendo usuario:', userError);
      return false;
    }

    if (!user) {
      console.error('❌ No hay usuario logueado');
      return false;
    }

    console.log('✅ Usuario logueado:', user.id);

    // Verificar rol de admin
    const { data: roles, error: rolesError } = await window.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('❌ Error obteniendo roles:', rolesError);
      return false;
    }

    const isAdmin = roles.some(r => r.role === 'admin');
    
    if (isAdmin) {
      console.log('✅ Eres administrador');
      return true;
    } else {
      console.error('❌ No tienes rol de administrador');
      return false;
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    return false;
  }
}

// Paso 2: Probar llamada a la función (SIN EJECUTAR REALMENTE)
async function testAdminUpdateBalanceFunction(targetUserId, newBalance, dryRun = true) {
  console.log(`🧪 Probando función ${dryRun ? '(DRY RUN)' : '(EJECUCIÓN REAL)'}:`, {
    targetUserId,
    newBalance
  });

  if (dryRun) {
    console.log('ℹ️  Esto es una prueba seca. No se ejecutará la función.');
    console.log('ℹ️  Para ejecutar realmente, usa testAdminUpdateBalanceFunction(userId, balance, false)');
    return;
  }

  try {
    const { data, error } = await window.supabase.rpc('admin_update_user_balance', {
      target_user_id: targetUserId,
      new_balance: newBalance,
      admin_notes: 'Prueba desde consola de desarrollador'
    });

    if (error) {
      console.error('❌ Error ejecutando función:', error);
      return;
    }

    console.log('✅ Función ejecutada exitosamente:', data);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Paso 3: Obtener lista de usuarios para pruebas
async function getUsersForTesting() {
  console.log('📋 Obteniendo usuarios para pruebas...');
  
  try {
    const { data, error } = await window.supabase
      .from('user_wallets')
      .select('user_id, balance')
      .limit(5);

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return;
    }

    console.log('📋 Usuarios disponibles para pruebas:');
    data.forEach((wallet, index) => {
      console.log(`${index + 1}. Usuario: ${wallet.user_id}, Balance actual: $${wallet.balance}`);
    });

    return data;
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Función principal para ejecutar todas las pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de función admin_update_user_balance...');
  
  // Verificar acceso
  const hasAccess = await checkAdminAccess();
  if (!hasAccess) {
    console.log('❌ Pruebas canceladas - Sin acceso de administrador');
    return;
  }

  // Obtener usuarios
  const users = await getUsersForTesting();
  if (!users || users.length === 0) {
    console.log('❌ No hay usuarios para probar');
    return;
  }

  // Hacer prueba seca con el primer usuario
  const firstUser = users[0];
  await testAdminUpdateBalanceFunction(firstUser.user_id, firstUser.balance + 100, true);

  console.log('\n📋 Para ejecutar una prueba real, usa:');
  console.log(`testAdminUpdateBalanceFunction('${firstUser.user_id}', ${firstUser.balance + 100}, false)`);
}

console.log('🔧 Script de prueba cargado. Ejecuta runTests() para comenzar las pruebas.');
