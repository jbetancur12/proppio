# DOCUMENTO DE DISEÑO TÉCNICO: ARQUITECTURA BASE SAAS (MULTI-TENANT)
**Versión:** 1.0  
**Estrategia:** Monolito Modular con Tenancy Lógica (Discriminator Column)  
**Stack:** React, TypeScript, Express, MikroORM, PostgreSQL.

## 1. Visión General y Definiciones
Este sistema opera bajo un modelo de Recursos Compartidos (Shared Resources) donde todos los clientes (Tenants) coexisten en la misma infraestructura y base de datos, pero están lógicamente aislados por un "Muro de Software" estricto.

### 1.1 Jerarquía de Entidades
*   **Platform (SaaS Owner):** Tú, el dueño. Tienes control absoluto "Cross-Tenant".
*   **Tenant (Organización):** El cliente que paga (ej: Una empresa). Es el contenedor de datos.
*   **User (Usuario):** Una persona que pertenece a un Tenant (o a varios, si el negocio lo permite).

## 2. Estrategia de Aislamiento de Datos ("The Wall")
El aislamiento se implementa en 3 Capas de Defensa (Defense in Depth). Si una capa falla, la siguiente detiene la fuga de datos.

### Capa 1: Contexto de Ejecución (Memory Level)
*   **Mecanismo:** `AsyncLocalStorage` (Node.js nativo).
*   **Función:** Almacenar el `tenantId` y `userId` durante el ciclo de vida de la petición HTTP. Evita pasar variables "prop drilling" por todos los servicios.
*   **Regla:** Ningún servicio de negocio puede ejecutarse si el contexto está vacío (excepto rutas públicas o webhooks del sistema).

### Capa 2: Aplicación / ORM (Logic Level - MikroORM)
*   **Lectura (Read):** Uso de Global Filters de MikroORM.
    *   Se aplica un `WHERE tenant_id = context.tenantId` automáticamente a todas las consultas `find`, `findOne`, `count`.
*   **Escritura (Write):** Uso de Event Subscribers (`beforeCreate`).
    *   Intercepta cualquier intento de crear un registro y fuerza la inyección del `tenantId` desde el contexto.
*   **Ventaja:** El desarrollador "Junior" no necesita recordar filtrar por cliente. El framework lo hace por él.

### Capa 3: Base de Datos (Storage Level - PostgreSQL)
*   **Mecanismo:** Row Level Security (RLS).
*   **Implementación:** Políticas nativas de SQL.
    ```sql
    CREATE POLICY tenant_isolation ON "projects" USING (tenant_id = current_setting('app.current_tenant')::uuid);
    ```
*   **Propósito:** Es la "red de seguridad final". Incluso si alguien inyecta SQL malicioso o bugea el ORM, Postgres rechazará devolver filas que no pertenezcan al tenant definido en la sesión.

## 3. Modelo de Datos Base (Schema Design)
El esquema se divide en dos grupos de tablas: System Tables (Globales) y Tenant Tables (Aisladas).

### 3.1 System Tables (Schema public - Sin tenant_id)
Estas tablas gestionan la existencia del SaaS.

*   **tenants:**
    *   `id` (PK, UUID), `name`, `status` (ACTIVE, SUSPENDED), `plan` (FREE, PRO), `config` (JSONB).
*   **users:**
    *   `id`, `email`, `password_hash`, `global_role` (SUPER_ADMIN, USER).
*   **tenant_users** (Tabla pivote para relación N:N opcional):
    *   `tenant_id`, `user_id`, `role_in_tenant` (ADMIN, MEMBER).
*   **subscriptions:**
    *   Relación con pasarela de pagos (Stripe ID), estado de facturación.

### 3.2 Tenant Tables (Con tenant_id)
Todas las tablas de negocio (ej: tasks, invoices, inventory).

*   **Requisito Obligatorio:**
    *   Columna: `tenant_id` (UUID, NOT NULL).
    *   Foreign Key: `FOREIGN KEY (tenant_id) REFERENCES tenants(id)`.
    *   Índice Compuesto: `INDEX (tenant_id, id)` o `INDEX (tenant_id, created_at)` para performance.

## 4. Gestión Operacional (El "Super Admin")
El dueño del SaaS necesita capacidades "divinas" sobre el sistema sin romper las reglas de negocio.

### 4.1 Roles del Sistema
*   **SUPER_ADMIN:** (Tú) Acceso al panel de administración (`/admin`). Puede ver todos los tenants, métricas financieras y logs.
*   **TENANT_OWNER:** (El Cliente) Puede gestionar su suscripción, sus usuarios y su configuración.
*   **TENANT_MEMBER:** (Empleado del Cliente) Solo opera el software.

### 4.2 Funcionalidades Críticas del Backoffice
*   **Tenant Provisioning (Onboarding):**
    *   Endpoint transaccional que crea: Tenant + Usuario Admin + Configuración inicial + Registro en Stripe.
*   **Impersonation (Suplantación de Identidad):**
    *   Capacidad de generar un token temporal para "ver lo que ve el cliente".
    *   **Técnicamente:** El Super Admin envía un header `x-impersonate-tenant: <uuid>`. El middleware detecta credenciales de Super Admin y configura el contexto con ese tenant ID.
*   **Kill Switch (Suspensión):**
    *   Middleware global que verifica `SELECT status FROM tenants WHERE id = context.tenantId`. Si es `SUSPENDED`, rechaza cualquier petición con error 402 (Payment Required).

## 5. Arquitectura de Autenticación y Autorización
### 5.1 Flujo de Login
1.  Usuario envía credenciales.
2.  Sistema valida pass.
3.  Sistema busca a qué tenants pertenece el usuario.
    *   **Caso 1 (Un solo tenant):** Login directo.
    *   **Caso 2 (Multi-tenant):** El usuario debe seleccionar a qué organización quiere entrar (como Slack o Discord).
4.  Se emite JWT conteniendo: `{ userId, tenantId, role }`.

### 5.2 Middleware de Seguridad (Express)
El pipeline de ejecución debe ser estricto:

1.  **Helmet:** Seguridad de cabeceras HTTP básica.
2.  **Cors:** Restringido a dominios conocidos.
3.  **RateLimit:** Protección DDoS por IP.
4.  **AuthMiddleware:** Valida JWT.
5.  **TenantContextMiddleware:**
    *   Lee el token.
    *   Inicializa `AsyncLocalStorage`.
    *   Setea la variable de sesión en Postgres (para RLS): `SET app.current_tenant = '...'`.
    *   MikroORM RequestContext: Crea el fork del Entity Manager.

## 6. Manejo de Webhooks y Tareas en Segundo Plano
En un SaaS, muchas cosas ocurren "fuera" del ciclo HTTP (ej: facturación recurrente, emails).

### 6.1 Colas (BullMQ + Redis)
Los trabajos en cola **DEBEN** guardar el `tenantId` en su payload.
Al procesar el trabajo (Worker), el sistema debe:
1.  Leer el `tenantId` del job.
2.  Inicializar manualmente un `RequestContext` de MikroORM.
3.  Inyectar el `tenantId` en el contexto para que los filtros funcionen igual que en la API.

### 6.2 Webhooks (ej: Stripe)
*   Los webhooks externos no traen autenticación de usuario.
*   Deben validarse por firma criptográfica.
*   Operan con un contexto de "Sistema" (Super Admin privileges) para poder actualizar el estado de la suscripción del tenant en la DB.

## 7. Checklist de Implementación para el Arquitecto
Antes de escribir la primera línea de código de negocio (ej: "Crear Tarea"), la infraestructura debe tener:

*   [ ] **DB:** Migraciones iniciales con tablas tenants, users y funciones RLS activas.
*   [ ] **Backend:** Configuración de MikroORM con BaseTenantEntity (Filter y Subscriber).
*   [ ] **Backend:** Middleware de AsyncLocalStorage testeado.
*   [ ] **Tests:** Un test de integración que intente leer datos del Tenant A usando un token del Tenant B y falle.
