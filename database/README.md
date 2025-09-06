# Database

Esta carpeta contiene todos los archivos relacionados con la base de datos del proyecto.

## Estructura

```
database/
├── README.md              # Este archivo
├── migrations/           # Scripts de migración ordenados cronológicamente
│   └── 001_scheduled_auctions_system.sql
├── schemas/             # Esquemas de base de datos
└── functions/           # Funciones de base de datos individuales
```

## Migraciones

Las migraciones están numeradas secuencialmente y deben ejecutarse en orden:

### 001_scheduled_auctions_system.sql
Sistema completo de subastas programadas que incluye:
- Tabla `scheduled_auctions` con índices y RLS
- Función generadora de productos dinámicos
- Funciones para gestionar subastas programadas:
  - `generate_scheduled_auctions_simple()`
  - `get_upcoming_scheduled_auctions_simple()`
  - `publish_scheduled_auctions()`
- Triggers automáticos
- Políticas de seguridad permisivas
- Permisos necesarios

## Cómo usar

1. **Para desarrollo local**: Ejecuta las migraciones en tu instancia local de Supabase
2. **Para producción**: Ejecuta el script completo en el SQL Editor de Supabase

## Automatización recomendada

Configura cron jobs para automatizar el sistema:

```bash
# Publicar subastas programadas cada 15 minutos
*/15 * * * * curl -X POST "https://tu-proyecto.supabase.co/rest/v1/rpc/publish_scheduled_auctions" -H "apikey: TU_API_KEY"

# Generar nuevas subastas diariamente a las 6:00 AM
0 6 * * * curl -X POST "https://tu-proyecto.supabase.co/rest/v1/rpc/generate_scheduled_auctions_simple" -H "apikey: TU_API_KEY" -d '{"days_ahead": 7, "auctions_per_day": 3}'
```

## Verificación

Después de ejecutar las migraciones, verifica que todo funcione:

```sql
-- Verificar instalación
SELECT * FROM public.scheduled_auctions LIMIT 5;

-- Probar generación
SELECT generate_scheduled_auctions_simple(1, 2);

-- Ver próximas subastas
SELECT * FROM get_upcoming_scheduled_auctions_simple(10);
```
