# 🔄 Sistema de Respaldo Automático
**Para Proyectos Lovable.dev con Supabase**

## 📋 Descripción

Sistema completo de respaldos automáticos que permite:
- ✅ Respaldo completo del código fuente
- ✅ Exportación de esquema y datos de Supabase
- ✅ Generación automática de prompt de recreación
- ✅ Respaldo de assets e imágenes
- ✅ Verificación de integridad con checksums
- ✅ Programación automática con cron
- ✅ Limpieza automática de respaldos antiguos
- ✅ Notificaciones por email (opcional)

## 🚀 Instalación

1. **Navegar al directorio de scripts:**
   ```bash
   cd scripts/
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Hacer ejecutables los scripts (Linux/Mac):**
   ```bash
   chmod +x backup.js schedule-backup.js verify-backup.js
   ```

## 📖 Uso

### 🔧 Respaldo Manual

```bash
# Ejecutar respaldo inmediato
npm run backup

# O directamente con node
node backup.js
```

### ⏰ Respaldo Programado

```bash
# Iniciar scheduler (respaldo automático semanal)
npm run backup:schedule

# Respaldo manual a través del scheduler
node schedule-backup.js --manual
```

### 🔍 Verificar Respaldo

```bash
# Verificar integridad de un respaldo específico
npm run restore:verify ../backups/backup-2024-01-15

# O directamente
node verify-backup.js ../backups/backup-2024-01-15
```

## 📁 Estructura de Respaldos

Cada respaldo genera una carpeta con esta estructura:

```
backups/
└── backup-YYYY-MM-DD/
    ├── source/                     # Código fuente completo
    │   ├── src/
    │   ├── public/
    │   └── ...
    ├── database/                   # Respaldo de Supabase
    │   ├── schema.sql             # Esquema de tablas
    │   ├── data.sql               # Datos exportados
    │   └── rls_policies.sql       # Políticas de seguridad
    ├── assets/                     # Imágenes y archivos estáticos
    ├── config/                     # Configuraciones adicionales
    ├── restoration-prompt.md       # Prompt automático para Lovable
    ├── restoration-guide.md        # Guía paso a paso
    ├── backup-manifest.json        # Metadata y checksums
    └── verification-report.txt     # Reporte de verificación
```

## ⚙️ Configuración

### 📅 Programación de Respaldos

Edita `schedule-backup.js` línea 8:

```javascript
// Cada domingo a las 3:00 AM
schedule: '0 3 * * 0',

// Para testing: cada 5 minutos
// schedule: '*/5 * * * *',
```

### 📧 Notificaciones por Email

En `schedule-backup.js` configura:

```javascript
notifications: {
  enabled: true, // Habilitar notificaciones
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'tu-email@gmail.com',
      pass: 'tu-app-password'        // App Password de Gmail
    },
    to: 'admin@tudominio.com'
  }
}
```

### 🧹 Limpieza Automática

```javascript
cleanup: {
  enabled: true,
  keepBackups: 4    // Mantener solo los últimos 4 respaldos
}
```

## 🔄 Proceso de Restauración

### 1. **Crear Nuevo Proyecto en Lovable**
   - Proyecto en blanco con React + TypeScript + Tailwind

### 2. **Configurar Supabase**
   - Crear nuevo proyecto en Supabase
   - Ejecutar los archivos SQL del respaldo

### 3. **Usar el Prompt Automático**
   - Copiar contenido de `restoration-prompt.md`
   - Pegar en Lovable para recreación automática

### 4. **Restaurar Manualmente (Alternativa)**
   - Copiar archivos de `source/` al proyecto
   - Subir imágenes de `assets/`
   - Actualizar credenciales de Supabase

## 🔍 Verificación de Integridad

El script de verificación valida:
- ✅ Estructura completa de directorios
- ✅ Integridad de archivos con checksums SHA-256
- ✅ Presencia de archivos críticos de BD
- ✅ Validación de contenido SQL

```bash
# Verificar el respaldo más reciente
ls -la ../backups/ | head -2 | tail -1 | awk '{print $9}' | xargs -I {} node verify-backup.js ../backups/{}
```

## 📊 Monitoreo

### Logs del Scheduler
```bash
# Ver logs en tiempo real del scheduler
node schedule-backup.js | tee backup.log
```

### Estados de Respaldo
- ✅ **Exitoso**: Todos los archivos respaldados correctamente
- ⚠️ **Advertencias**: Respaldo completado con problemas menores
- ❌ **Error**: Fallo crítico durante el respaldo

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de permisos:**
   ```bash
   chmod +x *.js
   ```

2. **Dependencias faltantes:**
   ```bash
   npm install --save node-cron nodemailer
   ```

3. **Error de Supabase:**
   - Verificar credenciales en `backup.js`
   - Confirmar acceso a la base de datos

4. **Error de email:**
   - Verificar configuración SMTP
   - Usar App Password para Gmail

### Debug Mode

Activar logs detallados:
```bash
DEBUG=backup:* node backup.js
```

## 🔒 Seguridad

- ❌ **NO** incluye variables de entorno sensibles
- ✅ **SÍ** incluye estructura de archivos
- ✅ **SÍ** incluye configuraciones públicas
- ✅ **SÍ** excluye datos de usuario por defecto
- ✅ **SÍ** genera checksums para verificación

## 📝 Logs y Auditoría

Cada respaldo genera:
- Timestamp de creación
- Lista completa de archivos
- Checksums de verificación
- Estadísticas de respaldo
- Reporte de errores (si los hay)

## 🎯 Casos de Uso

### Respaldo de Emergencia
```bash
# Respaldo inmediato antes de cambios críticos
node backup.js && echo "Respaldo de emergencia completado"
```

### Migración de Cuenta
```bash
# Crear respaldo para migrar a otra cuenta Lovable
node backup.js
# Usar restoration-prompt.md en la nueva cuenta
```

### Desarrollo en Equipo
```bash
# Respaldo programado para sincronización de equipo
node schedule-backup.js &
```

---

## 📞 Soporte

Para problemas o mejoras:
1. Verificar logs de error
2. Revisar configuración de Supabase
3. Comprobar permisos de archivos
4. Validar dependencias instaladas

**¡Tu proyecto está protegido con respaldos automáticos!** 🛡️