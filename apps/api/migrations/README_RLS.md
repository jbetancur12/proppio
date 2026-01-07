# Guía: Cómo Ejecutar Row Level Security (RLS)

## 🎯 Resumen

Existen **2 formas** de aplicar RLS en tu base de datos. Elige según tu escenario:

---

## Opción 1: Script SQL Manual (Desarrollo/Testing) ⚡

**Cuándo usarlo**: Para testing rápido en desarrollo o aplicar directo a producción con acceso manual a la DB.

### Ejecutar localmente:
```bash
# Desde la raíz del proyecto
docker exec -i rent-manager-db psql -U postgres -d rent_manager < apps/api/migrations/001_enable_rls.sql
```

### Ejecutar en producción:
```bash
# Conectar a la base de datos remota
psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f apps/api/migrations/001_enable_rls.sql
```

### Rollback si hay problemas:
```bash
docker exec -i rent-manager-db psql -U postgres -d rent_manager < apps/api/migrations/rollback_rls.sql
```

---

## Opción 2: Migración MikroORM (Producción Profesional) ✅

**Cuándo usarlo**: Para integrar RLS en el flujo de migraciones automáticas de MikroORM.

### Paso 1: Ejecutar migración
```bash
cd apps/api
npm run migration:up
```

### Paso 2: Verificar estado
```bash
npm run migration:pending  # Ver migraciones pendientes
```

### Rollback si es necesario:
```bash
npm run migration:down
```

---

## 📋 Scripts package.json necesarios

Agrega estos scripts a `apps/api/package.json`:

```json
{
  "scripts": {
    "migration:create": "mikro-orm migration:create",
    "migration:up": "mikro-orm migration:up",
    "migration:down": "mikro-orm migration:down",
    "migration:pending": "mikro-orm migration:pending",
    "migration:fresh": "mikro-orm migration:fresh"
  }
}
```

---

## ✅ Verificación Post-Migración

Después de aplicar RLS, **prueba esto**:

### Test 1: Sin contexto (debe retornar 0 filas)
```sql
-- Conectar a la DB
SELECT * FROM properties;  -- Debe retornar vacío
```

### Test 2: Con contexto (debe retornar datos del tenant)
```sql
SET app.current_tenant = '<tu-tenant-uuid>';
SELECT * FROM properties;  -- Debe mostrar propiedades del tenant
```

### Test 3: Via API (prueba cross-tenant)
```bash
# Login como Tenant A, crear propiedad
# Login como Tenant B, listar propiedades
# Verificar que la propiedad de A NO aparezca
```

---

## 🚨 Importante para Seeds

Si tienes seeds que insertan datos, debes modificarlos:

```typescript
// En tu archivo seed.ts
await em.getConnection().execute('SET session_replication_role = replica;');
// ... insertar datos
await em.getConnection().execute('SET session_replication_role = DEFAULT;');
```

---

## 🔄 Mi Recomendación

Para tu caso (desarrollo actual + futuro en producción):

1. **Ahora (Testing)**: Usa Opción 1 (SQL manual) para probar rápido
2. **Producción**: Usa Opción 2 (MikroORM migration) para control de versiones

**¿Cuál prefieres que ejecutemos?**
