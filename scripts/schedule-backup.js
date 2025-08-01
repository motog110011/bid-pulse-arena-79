#!/usr/bin/env node

const cron = require('node-cron');
const { execSync } = require('child_process');
const path = require('path');

// Configuración del scheduler
const BACKUP_CONFIG = {
  // Ejecutar cada domingo a las 3:00 AM
  schedule: '0 3 * * 0',
  // O para testing: cada 5 minutos
  // schedule: '*/5 * * * *',
  
  // Configuración de notificaciones
  notifications: {
    enabled: false, // Cambiar a true para habilitar notificaciones por email
    email: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'tu-email@gmail.com',
        pass: 'tu-app-password'
      },
      to: 'admin@tudominio.com'
    }
  },
  
  // Configuración de limpieza automática
  cleanup: {
    enabled: true,
    keepBackups: 4 // Mantener solo los últimos 4 respaldos
  }
};

class BackupScheduler {
  constructor() {
    this.isRunning = false;
    console.log('🕐 Scheduler de respaldos inicializado');
    console.log(`📅 Programado para: ${BACKUP_CONFIG.schedule}`);
  }

  start() {
    console.log('▶️ Iniciando scheduler de respaldos...');
    
    // Programar el respaldo automático
    cron.schedule(BACKUP_CONFIG.schedule, async () => {
      if (this.isRunning) {
        console.log('⚠️ Respaldo ya en ejecución, saltando...');
        return;
      }
      
      await this.runBackup();
    }, {
      scheduled: true,
      timezone: "America/Mexico_City"
    });
    
    console.log('✅ Scheduler iniciado correctamente');
    console.log('🔄 Esperando próxima ejecución programada...');
    
    // Mantener el proceso activo
    setInterval(() => {
      const now = new Date();
      console.log(`💓 Heartbeat: ${now.toISOString()} - Scheduler activo`);
    }, 3600000); // Cada hora
  }

  async runBackup() {
    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      console.log('🚀 Ejecutando respaldo programado...');
      
      // Ejecutar el script de respaldo
      const backupPath = path.join(__dirname, 'backup.js');
      execSync(`node ${backupPath}`, { stdio: 'inherit' });
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`✅ Respaldo completado en ${duration} segundos`);
      
      // Limpiar respaldos antiguos si está habilitado
      if (BACKUP_CONFIG.cleanup.enabled) {
        await this.cleanupOldBackups();
      }
      
      // Enviar notificación de éxito si está habilitada
      if (BACKUP_CONFIG.notifications.enabled) {
        await this.sendNotification('success', duration);
      }
      
    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.error('❌ Error durante el respaldo programado:', error.message);
      
      // Enviar notificación de error si está habilitada
      if (BACKUP_CONFIG.notifications.enabled) {
        await this.sendNotification('error', duration, error.message);
      }
    } finally {
      this.isRunning = false;
    }
  }

  async cleanupOldBackups() {
    try {
      console.log('🧹 Limpiando respaldos antiguos...');
      
      const fs = require('fs').promises;
      const backupsDir = path.join(__dirname, '..', 'backups');
      
      // Verificar que el directorio existe
      try {
        await fs.access(backupsDir);
      } catch {
        console.log('📁 No hay directorio de respaldos para limpiar');
        return;
      }
      
      // Obtener lista de respaldos
      const backupDirs = await fs.readdir(backupsDir);
      const backupFolders = backupDirs
        .filter(dir => dir.startsWith('backup-'))
        .sort()
        .reverse(); // Más recientes primero
      
      // Mantener solo los más recientes
      const toDelete = backupFolders.slice(BACKUP_CONFIG.cleanup.keepBackups);
      
      for (const folder of toDelete) {
        const folderPath = path.join(backupsDir, folder);
        await this.deleteDirectory(folderPath);
        console.log(`🗑️ Eliminado respaldo antiguo: ${folder}`);
      }
      
      console.log(`✅ Limpieza completada. Mantenidos: ${Math.min(backupFolders.length, BACKUP_CONFIG.cleanup.keepBackups)} respaldos`);
      
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error.message);
    }
  }

  async deleteDirectory(dirPath) {
    const fs = require('fs').promises;
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await this.deleteDirectory(itemPath);
        } else {
          await fs.unlink(itemPath);
        }
      }
      
      await fs.rmdir(dirPath);
    } catch (error) {
      console.error(`Error eliminando directorio ${dirPath}:`, error.message);
    }
  }

  async sendNotification(type, duration, error = null) {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter(BACKUP_CONFIG.notifications.email);
      
      const subject = type === 'success' 
        ? '✅ Respaldo Automático Completado'
        : '❌ Error en Respaldo Automático';
      
      const text = type === 'success'
        ? `El respaldo automático se completó exitosamente en ${duration} segundos.`
        : `Error durante el respaldo automático: ${error}\nDuración: ${duration} segundos`;
      
      await transporter.sendMail({
        from: BACKUP_CONFIG.notifications.email.auth.user,
        to: BACKUP_CONFIG.notifications.email.to,
        subject,
        text,
        html: `
          <h2>${subject}</h2>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Duración:</strong> ${duration} segundos</p>
          ${error ? `<p><strong>Error:</strong> ${error}</p>` : ''}
          <p><em>Sistema de respaldos automático - Lovable Project</em></p>
        `
      });
      
      console.log('📧 Notificación enviada por email');
    } catch (error) {
      console.error('❌ Error enviando notificación:', error.message);
    }
  }

  // Ejecutar respaldo manual inmediato
  async runManualBackup() {
    console.log('🔧 Ejecutando respaldo manual...');
    await this.runBackup();
  }
}

// CLI interface
if (require.main === module) {
  const scheduler = new BackupScheduler();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--manual') || args.includes('-m')) {
    // Respaldo manual
    scheduler.runManualBackup()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('💥 Error en respaldo manual:', error);
        process.exit(1);
      });
  } else {
    // Iniciar scheduler
    scheduler.start();
  }
}

module.exports = BackupScheduler;