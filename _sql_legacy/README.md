# SQL Legacy — Archivos históricos

Estos 30 archivos SQL estaban en la raíz del proyecto. Se movieron aquí el 2026-05-25
como archivo histórico. **No ejecutar ninguno de estos en producción.**

El esquema activo y canónico está en `supabase/migrations/`.

---

## Por qué existen estos archivos

El esquema de base de datos fue parcheado de forma iterativa durante el desarrollo con IA.
El problema raíz fue una colisión de tipos en la función `has_role`:
las migraciones iniciales la definieron con parámetro `app_role` (enum),
pero las políticas RLS intentaban pasarle `text`, causando errores en cascada
que generaron todos estos parches.

---

## Índice por categoría

### Intentos de setup completo
| Archivo | Qué intentaba |
|---|---|
| `clean_database_setup.sql` | Reescritura limpia de tablas base |
| `complete_database_setup.sql` | Setup completo con todas las tablas |
| `final_working_setup.sql` | Última versión "definitiva" antes de las migraciones |
| `minimal_working_setup.sql` | Versión reducida para diagnosticar el mínimo viable |
| `step_by_step_setup.sql` | Setup paso a paso para depuración manual |

### Parches de `has_role` y permisos admin
| Archivo | Qué intentaba |
|---|---|
| `fix_has_role_function.sql` | Primera corrección del tipo de parámetro |
| `simple_has_role_fix.sql` | Versión simplificada del fix |
| `final_has_role_fix.sql` | Enésimo intento de fix definitivo |
| `final_fix_with_casting.sql` | Fix con casting explícito de tipos |
| `fix_app_role_manual.sql` | Corrección manual del enum `app_role` |
| `fix_admin_permissions.sql` | Corrección de políticas RLS de admin |
| `fix_admin_permissions_v2.sql` | Segunda iteración |
| `fix_admin_permissions_v3.sql` | Tercera iteración |
| `fix_admin_permissions_final.sql` | Versión "final" de permisos |
| `diagnose_admin_functions.sql` | Script de diagnóstico de funciones admin |

### Parches de balance y billetera
| Archivo | Qué intentaba |
|---|---|
| `fix_admin_balance_function.sql` | Corrección de `admin_update_user_balance` |
| `fix_balance_function_complete.sql` | Reescritura completa con transacciones |
| `fix_balance_function_final.sql` | Versión final de la función de balance |

### Subastas programadas
| Archivo | Qué intentaba |
|---|---|
| `scheduled_auctions_system.sql` | Sistema completo de subastas programadas |
| `fix_publish_function.sql` | Fix de la función de publicación automática |
| `fix_get_upcoming_function.sql` | Fix de la función para obtener próximas subastas |
| `setup_dynamic_auctions.sql` | Configuración de subastas dinámicas |
| `manual_auction_rotation.sql` | Rotación manual de subastas (workaround sin cron) |

### Scripts de diagnóstico (nunca debieron commitearse)
| Archivo | Qué hacía |
|---|---|
| `debug_database_structure.sql` | Inspección de tablas y columnas existentes |
| `debug_functions.sql` | Diagnóstico de funciones en el schema |
| `debug_functions_fixed.sql` | Versión corregida del debug |
| `debug_scheduled_auctions.sql` | Debug específico de subastas programadas |
| `test_current_state.sql` | Snapshot del estado actual de la DB |
| `safe_get_detailed_users.sql` | Versión segura de la función de usuarios |

---

## Qué hacer en su lugar

1. Todas las migraciones nuevas van en `supabase/migrations/` con el CLI de Supabase:
   ```bash
   supabase migration new nombre_descriptivo
   ```

2. Para aplicar migraciones en producción:
   ```bash
   supabase db push
   ```

3. Para inspeccionar el estado actual de la DB:
   ```bash
   supabase db diff
   ```
