#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class BackupVerifier {
  constructor(backupPath) {
    this.backupPath = backupPath;
    this.manifest = null;
    this.issues = [];
    this.stats = {
      filesChecked: 0,
      checksumMatches: 0,
      checksumMismatches: 0,
      missingFiles: 0,
      extraFiles: 0
    };
  }

  async verify() {
    console.log('🔍 Iniciando verificación de respaldo...');
    console.log(`📂 Ruta: ${this.backupPath}`);
    
    try {
      await this.loadManifest();
      await this.verifyStructure();
      await this.verifyChecksums();
      await this.verifyDatabaseFiles();
      await this.generateReport();
      
      return this.issues.length === 0;
    } catch (error) {
      console.error('❌ Error durante la verificación:', error.message);
      return false;
    }
  }

  async loadManifest() {
    try {
      const manifestPath = path.join(this.backupPath, 'backup-manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      this.manifest = JSON.parse(manifestContent);
      console.log('✅ Manifiesto cargado correctamente');
    } catch (error) {
      throw new Error(`No se pudo cargar el manifiesto: ${error.message}`);
    }
  }

  async verifyStructure() {
    console.log('📁 Verificando estructura de directorios...');
    
    const requiredDirs = ['source', 'database', 'assets', 'config'];
    const requiredFiles = [
      'restoration-prompt.md',
      'restoration-guide.md',
      'backup-manifest.json'
    ];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.backupPath, dir);
      try {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
          this.issues.push(`${dir} no es un directorio`);
        }
      } catch {
        this.issues.push(`Directorio faltante: ${dir}`);
      }
    }
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.backupPath, file);
      try {
        await fs.access(filePath);
      } catch {
        this.issues.push(`Archivo faltante: ${file}`);
      }
    }
    
    console.log('✅ Verificación de estructura completada');
  }

  async verifyChecksums() {
    console.log('🔐 Verificando checksums de archivos...');
    
    for (const [relativePath, expectedHash] of Object.entries(this.manifest.checksums)) {
      const fullPath = path.join(this.backupPath, relativePath);
      this.stats.filesChecked++;
      
      try {
        const content = await fs.readFile(fullPath);
        const actualHash = crypto.createHash('sha256').update(content).digest('hex');
        
        if (actualHash === expectedHash) {
          this.stats.checksumMatches++;
        } else {
          this.stats.checksumMismatches++;
          this.issues.push(`Checksum no coincide: ${relativePath}`);
        }
      } catch {
        this.stats.missingFiles++;
        this.issues.push(`Archivo faltante: ${relativePath}`);
      }
    }
    
    console.log('✅ Verificación de checksums completada');
  }

  async verifyDatabaseFiles() {
    console.log('🗄️ Verificando archivos de base de datos...');
    
    const dbFiles = ['schema.sql', 'data.sql', 'rls_policies.sql'];
    
    for (const file of dbFiles) {
      const filePath = path.join(this.backupPath, 'database', file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Verificaciones básicas de contenido SQL
        if (file === 'schema.sql') {
          if (!content.includes('CREATE TABLE')) {
            this.issues.push(`${file} no contiene definiciones de tablas`);
          }
        }
        
        if (file === 'rls_policies.sql') {
          if (!content.includes('CREATE POLICY')) {
            this.issues.push(`${file} no contiene políticas RLS`);
          }
        }
        
      } catch {
        this.issues.push(`Archivo de BD faltante: ${file}`);
      }
    }
    
    console.log('✅ Verificación de archivos de BD completada');
  }

  async generateReport() {
    console.log('\n📊 REPORTE DE VERIFICACIÓN');
    console.log('=' .repeat(50));
    
    console.log(`📁 Respaldo: ${path.basename(this.backupPath)}`);
    console.log(`📅 Fecha de creación: ${this.manifest.created}`);
    console.log(`📦 Versión: ${this.manifest.version}`);
    
    console.log('\n📈 ESTADÍSTICAS:');
    console.log(`📄 Archivos verificados: ${this.stats.filesChecked}`);
    console.log(`✅ Checksums correctos: ${this.stats.checksumMatches}`);
    console.log(`❌ Checksums incorrectos: ${this.stats.checksumMismatches}`);
    console.log(`❓ Archivos faltantes: ${this.stats.missingFiles}`);
    
    if (this.issues.length === 0) {
      console.log('\n🎉 VERIFICACIÓN EXITOSA');
      console.log('✅ El respaldo está íntegro y completo');
    } else {
      console.log('\n⚠️ PROBLEMAS ENCONTRADOS:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    // Generar reporte detallado en archivo
    const reportPath = path.join(this.backupPath, 'verification-report.txt');
    const reportContent = this.generateDetailedReport();
    await fs.writeFile(reportPath, reportContent);
    
    console.log(`\n📄 Reporte detallado guardado en: ${reportPath}`);
  }

  generateDetailedReport() {
    const timestamp = new Date().toISOString();
    
    return `REPORTE DE VERIFICACIÓN DE RESPALDO
Generado: ${timestamp}
Respaldo: ${path.basename(this.backupPath)}
Fecha de creación: ${this.manifest.created}

ESTADÍSTICAS:
- Archivos verificados: ${this.stats.filesChecked}
- Checksums correctos: ${this.stats.checksumMatches}
- Checksums incorrectos: ${this.stats.checksumMismatches}
- Archivos faltantes: ${this.stats.missingFiles}

RESULTADO: ${this.issues.length === 0 ? 'EXITOSO' : 'PROBLEMAS ENCONTRADOS'}

${this.issues.length > 0 ? 'PROBLEMAS:\n' + this.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n') : 'No se encontraron problemas.'}

INFORMACIÓN DEL MANIFIESTO:
- Project ID: ${this.manifest.projectId}
- Total de archivos originales: ${this.manifest.stats.totalFiles}
- Tamaño total: ${Math.round(this.manifest.stats.totalSize / 1024)} KB
- Assets respaldados: ${this.manifest.stats.assetsCount}

Este reporte verifica la integridad del respaldo mediante checksums SHA-256 
y validación de estructura. Un respaldo exitoso garantiza que todos los 
archivos están presentes y no han sido modificados.
`;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 Uso: node verify-backup.js <ruta-del-respaldo>');
    console.log('📖 Ejemplo: node verify-backup.js ../backups/backup-2024-01-15');
    process.exit(1);
  }
  
  const backupPath = args[0];
  
  try {
    await fs.access(backupPath);
  } catch {
    console.error('❌ Error: El directorio de respaldo no existe');
    process.exit(1);
  }
  
  const verifier = new BackupVerifier(backupPath);
  const isValid = await verifier.verify();
  
  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = BackupVerifier;