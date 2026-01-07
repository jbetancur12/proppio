# Guía de Deployment para Producción

## 📦 Orden de Migraciones

Las migraciones se ejecutan en orden alfabético:

1. **Migration20260107_000_InitialSchema.ts** - Crea todas las tablas base
2. **Migration20260107_001_EnableRLS.ts** - Habilita Row Level Security

---

## 🚀 Primera Vez (Setup Inicial de Producción)

### 1. Preparar el servidor

```bash
# Clonar repositorio
git clone <tu-repositorio>
cd rent-manager

# Instalar dependencias
npm install
```

### 2. Configurar variables de entorno

Crear `.env` en `apps/api/`:

```env
DB_HOST=<tu-db-host>
DB_PORT=5432
DB_NAME=rent_manager
DB_USER=<tu-db-user>
DB_PASSWORD=<tu-db-password>

JWT_SECRET=<tu-secret-fuerte>

MINIO_ENDPOINT=<tu-minio-endpoint>
MINIO_PORT=9000
MINIO_ACCESS_KEY=<tu-access-key>
MINIO_SECRET_KEY=<tu-secret-key>
MINIO_BUCKET=rent-manager
```

### 3. Compilar el proyecto

```bash
cd apps/api
npm run build
```

### 4. Ejecutar migraciones (CREA TODAS LAS TABLAS)

```bash
npm run migration:up
```

**Output esperado:**
```
[migrator] Processing 'Migration20260107_000_InitialSchema'
[migrator] Applied 'Migration20260107_000_InitialSchema'
[migrator] Processing 'Migration20260107_001_EnableRLS'
[migrator] Applied 'Migration20260107_001_EnableRLS'
Successfully migrated up to the latest version
```

### 5. Crear tenant inicial (Super Admin)

```bash
# Conectar a la DB y ejecutar:
psql -h <DB_HOST> -U <DB_USER> -d rent_manager

INSERT INTO tenants (id, name, status) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Super Admin', 'ACTIVE');
```

### 6. Iniciar la aplicación

```bash
npm start
```

---

## 🔄 Actualizaciones Futuras (Deploy de Nuevos Cambios)

### 1. Hacer pull del código actualizado

```bash
git pull origin master
```

### 2. Instalar nuevas dependencias (si las hay)

```bash
npm install
```

### 3. Compilar

```bash
npm run build
```

### 4. Ejecutar solo migraciones nuevas

```bash
npm run migration:up
```

MikroORM detecta automáticamente qué migraciones ya se ejecutaron y solo aplica las nuevas.

### 5. Reiniciar la aplicación

```bash
pm2 restart rent-manager-api
# o
systemctl restart rent-manager
```

---

## 🧪 Verificar Migraciones

### Ver migraciones pendientes

```bash
npm run migration:pending
```

### Ver estado de migraciones

```bash
# Conectar a la DB
psql -h <DB_HOST> -U <DB_USER> -d rent_manager

# Ver tabla de migraciones
SELECT * FROM mikro_orm_migrations;
```

---

## 🔙 Rollback (En caso de emergencia)

### Deshacer última migración

```bash
npm run migration:down
```

### Deshacer migración específica

```bash
# Conectar a DB y ejecutar manualmente el método down() de la migración
# O usar rollback_rls.sql para RLS específicamente
psql -h <DB_HOST> -U <DB_USER> -d rent_manager < apps/api/migrations/rollback_rls.sql
```

---

## 📋 Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL creada
- [ ] MinIO/S3 configurado
- [ ] `npm install` ejecutado
- [ ] `npm run build` sin errores
- [ ] `npm run migration:up` ejecutado
- [ ] Tenant inicial creado
- [ ] Aplicación iniciada correctamente
- [ ] Login funcionando
- [ ] RLS verificado (queries aislados por tenant)

---

## 🛡️ Seguridad en Producción

1. **JWT_SECRET**: Usar un string aleatorio fuerte (min 32 caracteres)
2. **DB_PASSWORD**: Contraseña fuerte, rotar periódicamente
3. **CORS**: Configurar dominios permitidos en `app.ts`
4. **HTTPS**: Usar certificado SSL (Let's Encrypt)
5. **Rate Limiting**: Configurar límites de requests por IP

---

## 📊 Monitoreo

### Logs de migraciones

```bash
# Ver logs de la aplicación
pm2 logs rent-manager-api

# Ver últimas migraciones aplicadas
SELECT * FROM mikro_orm_migrations ORDER BY executed_at DESC LIMIT 10;
```

### Health Check

```bash
curl https://tu-dominio.com/health
```

Debe retornar:
```json
{
  "status": "ok",
  "timestamp": "2026-01-07T..."
}
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
npm install pg
```

### Error: Migraciones no se ejecutan
```bash
# Verificar configuración
cat apps/api/src/mikro-orm.config.ts

# Verificar que exista la carpeta de migraciones
ls apps/api/dist/migrations
```

### Error: RLS bloquea queries
```bash
# Verificar que authMiddleware esté configurando el tenant
# Ver logs: debe aparecer "SET LOCAL app.current_tenant = ..."
```

### Resetear DB completamente (PELIGRO - solo desarrollo)
```bash
npm run migration:fresh  # Borra todo y recrea
```
