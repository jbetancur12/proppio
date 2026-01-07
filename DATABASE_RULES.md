# REGLAS DE GESTIÓN DE BASE DE DATOS

**Versión:** 1.0  
**Fecha:** 2026-01-07  
**Propósito:** Establecer reglas estrictas para cambios en el schema de la base de datos.

---

## 🚨 REGLA ABSOLUTA

**Todos los cambios en el schema de la base de datos DEBEN hacerse mediante migraciones de MikroORM.**  
**NUNCA se debe modificar el schema manualmente.**

---

## ✅ Flujo Correcto

### En Desarrollo

1. **Modificar Entity TypeScript:**
   ```typescript
   // Ejemplo: Agregar campo a Property
   @Property()
   city?: string;
   ```

2. **Generar migración:**
   ```bash
   npm run migration:create -- --name=AddCityToProperty
   ```

3. **Revisar migración generada:**
   ```typescript
   // src/migrations/Migration20260107_AddCityToProperty.ts
   async up(): Promise<void> {
     this.addSql('ALTER TABLE properties ADD COLUMN city VARCHAR(255);');
   }
   ```

4. **Ejecutar migración:**
   ```bash
   npm run migration:up
   ```

### En Producción

1. **Deploy código actualizado**
2. **Ejecutar migraciones:**
   ```bash
   npm run migration:up
   ```
3. MikroORM automáticamente detecta y ejecuta solo migraciones nuevas.

---

## ❌ PROHIBICIONES ABSOLUTAS

### NUNCA hacer esto:

1. ❌ Ejecutar `ALTER TABLE` manualmente en psql/pgAdmin
2. ❌ Usar `schemaGenerator.updateSchema()` en producción
3. ❌ Modificar tablas directamente sin documentar en migración
4. ❌ Ejecutar scripts SQL ad-hoc en producción
5. ❌ Crear tablas/columnas "temporales" sin migración

### SIEMPRE hacer esto:

1. ✅ Usar `npm run migration:create` para generar migraciones
2. ✅ Incluir método `down()` funcional en cada migración
3. ✅ Versionar migraciones en Git
4. ✅ Probar migraciones en local antes de producción
5. ✅ Documentar cambios complejos en comentarios

---

## 📋 Orden de Migraciones

Las migraciones se ejecutan en orden alfabético:

```
src/migrations/
├── Migration20260107_000_InitialSchema.ts    # Schema base
├── Migration20260107_001_EnableRLS.ts        # Row Level Security
├── Migration20260107_002_AddCityField.ts     # Cambios siguientes
└── Migration20260107_003_CreateIndexes.ts    # Optimizaciones
```

**Convención de nombres:**
- Fecha: `YYYYMMDD`
- Número secuencial: `000`, `001`, `002`
- Descripción: `PascalCase`

---

## 🔄 Rollback

Cada migración DEBE tener un `down()` funcional:

```typescript
export class Migration20260107_002_AddCity extends Migration {
  async up(): Promise<void> {
    this.addSql('ALTER TABLE properties ADD COLUMN city VARCHAR(255);');
  }

  async down(): Promise<void> {
    this.addSql('ALTER TABLE properties DROP COLUMN city;');
  }
}
```

**Ejecutar rollback:**
```bash
npm run migration:down  # Deshace última migración
```

---

## 🌱 Seeds vs Migraciones

| Aspecto | Migraciones | Seeds |
|---------|-------------|-------|
| **Propósito** | Cambios de estructura (DDL) | Datos iniciales (DML) |
| **Ejemplos** | CREATE TABLE, ALTER TABLE, CREATE INDEX | INSERT tenant inicial, datos demo |
| **Cuándo** | Siempre en producción | Solo desarrollo/testing |
| **Comando** | `npm run migration:up` | Script custom |

**Para seeds con RLS:**
```typescript
// Bypass RLS temporalmente
await em.getConnection().execute('SET session_replication_role = replica;');
// Insertar datos
await em.getConnection().execute('SET session_replication_role = DEFAULT;');
```

---

## ✅ Checklist Pre-Deployment

Antes de hacer deploy a producción:

- [ ] Todas las migraciones nuevas creadas y probadas localmente
- [ ] Método `down()` implementado para rollback
- [ ] Migraciones versionadas en Git
- [ ] No hay ALTER TABLE manual en el historial
- [ ] Backup de la base de datos tomado
- [ ] Plan de rollback documentado

---

## 🆘 Emergencias

### Si ejecutaste un cambio manual por error:

1. **Crear migración que documente el cambio:**
   ```bash
   npm run migration:create -- --name=DocumentManualChange
   ```

2. **En el método `up()`, verificar si ya existe:**
   ```typescript
   async up(): Promise<void> {
     // Verificar primero si existe
     this.addSql(`
       DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='properties' AND column_name='city') 
         THEN
           ALTER TABLE properties ADD COLUMN city VARCHAR(255);
         END IF;
       END $$;
     `);
   }
   ```

3. **Ejecutar migración para sincronizar:**
   ```bash
   npm run migration:up
   ```

---

## 📚 Referencias

- **MikroORM Migrations:** https://mikro-orm.io/docs/migrations
- **DEPLOYMENT.md:** Guía de deployment en producción
- **technical_design.md:** Arquitectura completa del sistema

---

**Recordatorio:** La consistencia del schema es crítica para multi-tenancy.  
Un cambio mal aplicado puede causar data leaks cross-tenant.
