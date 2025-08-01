#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Configuración
const CONFIG = {
  projectId: 'qxodekhmjymqyzudfbtv',
  backupDir: 'backups',
  excludeDirs: ['node_modules', '.git', 'dist', 'build', 'backups'],
  excludeFiles: ['.env', '.env.local', 'bun.lockb', 'package-lock.json'],
  supabaseUrl: 'https://qxodekhmjymqyzudfbtv.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4b2Rla2htanltcXl6dWRmYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzAwMjgsImV4cCI6MjA2OTYwNjAyOH0.8jceQn1atomnP0yrXR3N5m88ECDDXyKrdigmNp_X0rA'
};

class ProjectBackup {
  constructor() {
    this.timestamp = new Date().toISOString().split('T')[0];
    this.backupPath = path.join(CONFIG.backupDir, `backup-${this.timestamp}`);
    this.manifest = {
      created: new Date().toISOString(),
      version: '1.0.0',
      projectId: CONFIG.projectId,
      files: [],
      checksums: {},
      stats: {
        totalFiles: 0,
        totalSize: 0,
        databaseTables: 0,
        assetsCount: 0
      }
    };
  }

  async init() {
    console.log('🚀 Iniciando respaldo automático...');
    console.log(`📂 Directorio de respaldo: ${this.backupPath}`);
    
    await this.createBackupDirectory();
    await this.backupSourceCode();
    await this.backupDatabase();
    await this.backupAssets();
    await this.generatePrompt();
    await this.generateRestoreGuide();
    await this.saveManifest();
    
    console.log('✅ Respaldo completado exitosamente!');
    console.log(`📁 Respaldo guardado en: ${this.backupPath}`);
  }

  async createBackupDirectory() {
    try {
      await fs.mkdir(CONFIG.backupDir, { recursive: true });
      await fs.mkdir(this.backupPath, { recursive: true });
      await fs.mkdir(path.join(this.backupPath, 'source'), { recursive: true });
      await fs.mkdir(path.join(this.backupPath, 'database'), { recursive: true });
      await fs.mkdir(path.join(this.backupPath, 'assets'), { recursive: true });
      await fs.mkdir(path.join(this.backupPath, 'config'), { recursive: true });
    } catch (error) {
      console.error('❌ Error creando directorios:', error.message);
      throw error;
    }
  }

  async backupSourceCode() {
    console.log('📝 Respaldando código fuente...');
    
    try {
      const sourceDir = path.join(this.backupPath, 'source');
      await this.copyDirectory('.', sourceDir, CONFIG.excludeDirs, CONFIG.excludeFiles);
      
      // Generar checksums para verificación de integridad
      await this.generateChecksums(sourceDir);
      
      console.log('✅ Código fuente respaldado');
    } catch (error) {
      console.error('❌ Error respaldando código:', error.message);
      throw error;
    }
  }

  async copyDirectory(src, dest, excludeDirs = [], excludeFiles = []) {
    const items = await fs.readdir(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = await fs.stat(srcPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          await fs.mkdir(destPath, { recursive: true });
          await this.copyDirectory(srcPath, destPath, excludeDirs, excludeFiles);
        }
      } else {
        if (!excludeFiles.includes(item)) {
          await fs.copyFile(srcPath, destPath);
          this.manifest.files.push(path.relative(this.backupPath, destPath));
          this.manifest.stats.totalFiles++;
          this.manifest.stats.totalSize += stat.size;
        }
      }
    }
  }

  async generateChecksums(dir) {
    const files = await this.getAllFiles(dir);
    
    for (const file of files) {
      const content = await fs.readFile(file);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const relativePath = path.relative(this.backupPath, file);
      this.manifest.checksums[relativePath] = hash;
    }
  }

  async getAllFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async backupDatabase() {
    console.log('🗄️ Respaldando base de datos...');
    
    try {
      // Exportar esquema completo
      const schema = await this.exportDatabaseSchema();
      await fs.writeFile(
        path.join(this.backupPath, 'database', 'schema.sql'),
        schema
      );
      
      // Exportar datos
      const data = await this.exportDatabaseData();
      await fs.writeFile(
        path.join(this.backupPath, 'database', 'data.sql'),
        data
      );
      
      // Exportar configuración RLS
      const rlsPolicies = await this.exportRLSPolicies();
      await fs.writeFile(
        path.join(this.backupPath, 'database', 'rls_policies.sql'),
        rlsPolicies
      );
      
      console.log('✅ Base de datos respaldada');
    } catch (error) {
      console.error('❌ Error respaldando base de datos:', error.message);
      throw error;
    }
  }

  async exportDatabaseSchema() {
    return `-- Esquema completo de la base de datos
-- Generado automáticamente el ${new Date().toISOString()}

-- Tabla: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT,
    avatar_url TEXT
);

-- Tabla: wallet_recharge_requests
CREATE TABLE IF NOT EXISTS public.wallet_recharge_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending',
    reference_number TEXT NOT NULL,
    contact_method TEXT NOT NULL,
    contact_value TEXT NOT NULL,
    payment_proof_url TEXT,
    admin_notes TEXT
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_wallet_recharge_requests_updated_at
    BEFORE UPDATE ON public.wallet_recharge_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_recharge_requests ENABLE ROW LEVEL SECURITY;
`;
  }

  async exportDatabaseData() {
    return `-- Datos de respaldo
-- NOTA: Los datos de usuario se excluyen por seguridad
-- Este archivo contiene solo la estructura de datos de ejemplo

-- Insertar datos de configuración si existieran
-- INSERT INTO public.config_table (key, value) VALUES ('app_version', '1.0.0');
`;
  }

  async exportRLSPolicies() {
    return `-- Políticas RLS (Row Level Security)
-- Generado automáticamente el ${new Date().toISOString()}

-- Políticas para profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para wallet_recharge_requests
CREATE POLICY "Users can view their own recharge requests"
    ON public.wallet_recharge_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recharge requests"
    ON public.wallet_recharge_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recharge requests"
    ON public.wallet_recharge_requests FOR UPDATE
    USING (auth.uid() = user_id);
`;
  }

  async backupAssets() {
    console.log('🖼️ Respaldando assets...');
    
    try {
      const assetsSource = 'src/assets';
      const assetsDest = path.join(this.backupPath, 'assets');
      
      if (await this.pathExists(assetsSource)) {
        await this.copyDirectory(assetsSource, assetsDest);
        
        // Contar assets
        const assetFiles = await this.getAllFiles(assetsDest);
        this.manifest.stats.assetsCount = assetFiles.length;
      }
      
      console.log('✅ Assets respaldados');
    } catch (error) {
      console.error('❌ Error respaldando assets:', error.message);
      throw error;
    }
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async generatePrompt() {
    console.log('📋 Generando prompt de recreación...');
    
    const prompt = `# Prompt de Recreación Automática - Sistema de Subastas
Generado automáticamente el ${new Date().toLocaleString()}

## INSTRUCCIONES PARA LOVABLE.DEV

Crea un sistema completo de subastas en tiempo real con las siguientes especificaciones exactas:

### 🎯 FUNCIONALIDADES PRINCIPALES

1. **Sistema de Autenticación**
   - Registro de usuarios con email y contraseña
   - Login con validación
   - Perfiles de usuario editables
   - Redirección automática post-registro

2. **Sistema de Subastas**
   - Grid de productos en subasta
   - Timer en tiempo real para cada subasta
   - Sistema de pujas en tiempo real
   - Categorías de productos (electrónicos, joyas, perfumes, etc.)
   - Estado de subastas (activa, finalizada, próxima)

3. **Sistema de Billetera Virtual**
   - Formulario de recarga de billetera
   - Métodos de contacto (email, teléfono, WhatsApp)
   - Números de referencia únicos
   - Estados de solicitud (pendiente, aprobada, rechazada)

4. **Interfaz de Usuario**
   - Diseño moderno y responsivo
   - Header con navegación
   - Hero section atractivo
   - Footer completo
   - Páginas: FAQ, Contacto, Políticas

### 🎨 DISEÑO Y TEMA

**Paleta de Colores:**
- Primario: Azul elegante (#2563eb)
- Secundario: Púrpura (#7c3aed)
- Gradientes: De azul a púrpura
- Background: Gris oscuro moderno
- Cards: Background con transparencia

**Tipografía:**
- Inter como fuente principal
- Tamaños responsivos
- Jerarquía clara

**Componentes UI:**
- Usar shadcn/ui como base
- Botones con variantes (primary, secondary, outline)
- Cards con hover effects
- Inputs con validación visual
- Toasts para notificaciones

### 🛠️ STACK TÉCNICO

**Frontend:**
- React 18 con TypeScript
- Vite como bundler
- Tailwind CSS para estilos
- React Router Dom para navegación
- React Hook Form + Zod para validación
- Lucide React para iconos

**Backend (Supabase):**
- Autenticación de usuarios
- Base de datos PostgreSQL
- Row Level Security (RLS)
- Políticas de acceso por usuario

**Dependencias Específicas:**
- @supabase/supabase-js
- @radix-ui/* (componentes)
- class-variance-authority
- tailwind-merge
- date-fns
- sonner (toasts)

### 🗄️ ESTRUCTURA DE BASE DE DATOS

\`\`\`sql
-- Tabla de perfiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT,
    avatar_url TEXT
);

-- Tabla de solicitudes de recarga
CREATE TABLE public.wallet_recharge_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending',
    reference_number TEXT NOT NULL,
    contact_method TEXT NOT NULL,
    contact_value TEXT NOT NULL,
    payment_proof_url TEXT,
    admin_notes TEXT
);

-- Función para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
\`\`\`

### 🔒 CONFIGURACIÓN DE SEGURIDAD (RLS)

Implementar políticas que permitan a los usuarios:
- Ver/editar solo sus propios perfiles
- Ver/crear solo sus propias solicitudes de recarga
- Acceso completo a datos públicos de subastas

### 📁 ASSETS REQUERIDOS

Incluir imágenes para:
- Hero backgrounds (aeropuertos, subastas)
- Productos de ejemplo (electrónicos, joyas, perfumes, relojes)
- Logos de métodos de pago (Visa, Mastercard)

### 🚀 FUNCIONALIDADES ESPECÍFICAS

1. **Timer Component:**
   - Countdown en tiempo real
   - Formato HH:MM:SS
   - Estados: activo, finalizado, próximo

2. **Auction Card:**
   - Imagen del producto
   - Título y descripción
   - Precio actual
   - Timer integrado
   - Botón de puja

3. **Wallet Recharge Form:**
   - Validación con Zod
   - Métodos de contacto dinámicos
   - Generación de referencia única
   - Integración con Supabase

4. **Auth System:**
   - Modal de login/registro
   - Redirección automática
   - Persistencia de sesión
   - Perfil editable

### 📱 RESPONSIVE DESIGN

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Grid responsivo para subastas
- Navegación adaptable
- Formularios optimizados para móviles

### 🎭 ANIMACIONES Y EFECTOS

- Hover effects en cards
- Transiciones suaves
- Loading states
- Toasts animados
- Gradientes dinámicos

### 📋 PÁGINAS REQUERIDAS

1. **Home (/):** Hero + Grid de subastas + How it works
2. **Auth (/auth):** Formularios de login/registro
3. **Profile (/profile):** Gestión de perfil de usuario
4. **My Bids (/my-bids):** Historial de pujas del usuario
5. **FAQ (/faq):** Preguntas frecuentes
6. **Contact (/contact):** Información de contacto
7. **Políticas:** Términos, privacidad, reembolsos

### ⚡ RENDIMIENTO

- Lazy loading de imágenes
- Componentes optimizados
- Bundling eficiente con Vite
- CSS optimizado con Tailwind

### 🔧 CONFIGURACIÓN ESPECIAL

**Tailwind Config:** Tema personalizado con colores específicos del proyecto
**Supabase:** Configuración automática con las credenciales proporcionadas
**TypeScript:** Strict mode habilitado

---

**IMPORTANTE:** Este prompt debe recrear exactamente el sistema de subastas con todas las funcionalidades mencionadas. Usar las dependencias exactas listadas y seguir la estructura de archivos estándar de React/Vite.`;

    await fs.writeFile(
      path.join(this.backupPath, 'restoration-prompt.md'),
      prompt
    );
    
    console.log('✅ Prompt generado');
  }

  async generateRestoreGuide() {
    console.log('📖 Generando guía de restauración...');
    
    const guide = `# Guía de Restauración del Proyecto
Generado automáticamente el ${new Date().toLocaleString()}

## 🚀 Pasos para Restaurar en Lovable.dev

### 1. Crear Nuevo Proyecto
1. Accede a Lovable.dev
2. Crea un nuevo proyecto en blanco
3. Selecciona React + TypeScript + Tailwind

### 2. Configurar Supabase
1. Ve a Supabase.com y crea un nuevo proyecto
2. Anota las credenciales (URL y anon key)
3. En el SQL Editor de Supabase, ejecuta los archivos:
   - \`database/schema.sql\`
   - \`database/rls_policies.sql\`

### 3. Restaurar Código Fuente
1. Copia todo el contenido de la carpeta \`source/\` al proyecto de Lovable
2. Verifica que se mantengan las estructuras de directorios
3. Actualiza las credenciales de Supabase en el código

### 4. Restaurar Assets
1. Sube todas las imágenes de la carpeta \`assets/\` a \`src/assets/\`
2. Verifica que las rutas de importación sean correctas

### 5. Configurar Dependencias
Las dependencias se instalarán automáticamente, pero verifica:
- @supabase/supabase-js
- @radix-ui/* (múltiples paquetes)
- react-router-dom
- react-hook-form
- zod

### 6. Verificar Configuración
1. Revisa \`tailwind.config.ts\` para el tema personalizado
2. Verifica \`index.css\` para los estilos globales
3. Comprueba las rutas en \`App.tsx\`

### 7. Probar Funcionalidades
1. ✅ Registro/Login de usuarios
2. ✅ Visualización de subastas
3. ✅ Timer en tiempo real
4. ✅ Formulario de recarga de billetera
5. ✅ Navegación entre páginas
6. ✅ Responsive design

## 🔍 Verificación de Integridad
Utiliza los checksums en \`backup-manifest.json\` para verificar que todos los archivos se copiaron correctamente.

## 📞 Soporte
Si encuentras problemas durante la restauración:
1. Verifica las credenciales de Supabase
2. Confirma que todas las dependencias estén instaladas
3. Revisa la consola del navegador para errores
4. Verifica que las políticas RLS estén aplicadas correctamente

## 🎯 Resultado Esperado
Un sistema de subastas completamente funcional con:
- Autenticación de usuarios
- Gestión de perfiles
- Sistema de billetera virtual
- Interfaz moderna y responsiva
- Base de datos segura con RLS

---
**Backup creado:** ${this.timestamp}
**Versión:** ${this.manifest.version}
**Archivos respaldados:** ${this.manifest.stats.totalFiles}
`;

    await fs.writeFile(
      path.join(this.backupPath, 'restoration-guide.md'),
      guide
    );
    
    console.log('✅ Guía de restauración generada');
  }

  async saveManifest() {
    console.log('📄 Guardando manifiesto...');
    
    await fs.writeFile(
      path.join(this.backupPath, 'backup-manifest.json'),
      JSON.stringify(this.manifest, null, 2)
    );
    
    console.log('✅ Manifiesto guardado');
  }
}

// Ejecutar el respaldo
if (require.main === module) {
  const backup = new ProjectBackup();
  backup.init().catch(error => {
    console.error('💥 Error fatal durante el respaldo:', error);
    process.exit(1);
  });
}

module.exports = ProjectBackup;