# GUÍA DE ARQUITECTURA Y ESTÁNDARES DE DESARROLLO

**Propósito:** Garantizar que el código sea escalable, mantenible y fácil de entender a largo plazo. Este documento es ley para cualquier contribución al código.

## 1. Principios Fundamentales (The Core Philosophy)

### 1.1 S.O.L.I.D. en la Práctica
*   **SRP (Single Responsibility Principle):**
    *   *Regla:* Cada módulo, clase o función debe tener **una única razón para cambiar**.
    *   *Ejemplo Backend:* Un `LeaseController` solo recibe la petición HTTP y responde JSON. No calcula impuestos ni hace consultas SQL directas. Eso lo delega a `LeaseService`.
    *   *Ejemplo Frontend:* Un componente `Button` no debe saber sobre la lógica de autenticación. Solo renderiza y emite eventos `onClick`.
*   **DIP (Dependency Inversion):**
    *   *Regla:* Los módulos de alto nivel no deben depender de bajos niveles. Ambos deben depender de abstracciones.
    *   *Backend:* Usaremos Inyección de Dependencias. El Servicio recibe el Repositorio como argumento, no lo instancia adentro. Esto facilita los Mocks en tests.

### 1.2 Separación de Intereses (Separation of Concerns - SoC)
El sistema se divide en capas estrictas. Una capa solo puede hablar con su capa inmediatamente inferior.

1.  **Capa de Presentación (Frontend / API Controllers):** ¿Cómo se ve? / ¿Qué me piden?
2.  **Capa de Aplicación (Use Cases / Services):** ¿Qué hace el negocio? (Orquestación).
3.  **Capa de Dominio (Entities / Core Logic):** ¿Cuáles son las reglas puras? (Cálculos de mora, validaciones de estado).
4.  **Capa de Infraestructura (DB / External APIs):** ¿Cómo se guardan los datos?

## 2. Patrones de Diseño Backend (Node.js + MikroORM)

### 2.1 Services Pattern
Toda la lógica de negocio vive en Servicios.
*   ✅ `AuthService.login()`
*   ✅ `PaymentService.processTransaction()`
*   ❌ No lógica en `router.post('/login', ...)`

### 2.2 Repository Pattern (vía MikroORM)
Abstrae el acceso a datos. Si mañana cambiamos Postgres por Mongo (hipotéticamente), los Servicios no deberían enterarse.

### 2.3 Error Handling Centralizado
*   No usar `try/catch` en cada función. Usar un middleware global de manejo de erorres (`ErrorHandler`).
*   Lanzar errores tipados: `throw new BusinessLogicError("El contrato ya está activo")`.

### 2.4 Estándar de API (Responses & Errors)
Todas las respuestas de la API deben seguir estrictamente este formato JSON:

**Éxito (200/201):**
```json
{
  "success": true,
  "data": { ... },     // Objeto o Array
  "message": "Operación exitosa", // Opcional
  "timestamp": "2023-10-27T10:00:00Z"
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR", // Código legible por máquina
    "message": "El email es inválido", // Mensaje legible por humano
    "details": [...] // Opcional (ej: errores de Zod)
  },
  "timestamp": "2023-10-27T10:00:00Z"
}
```
*   Usar `ApiResponse.success/created` y `AppError` para garantizar esto.

## 3. Patrones de Diseño Frontend (React)

### 3.1 Container vs. Presentational Components
*   **Presentational (UI):** Son "tontos". Reciben datos por `props` y emiten eventos. No tienen efectos secundarios ni llaman a APIs. (Ej: `InvoiceCard`, `PrimaryButton`).
*   **Container (Features):** Son "listos". Tienen el estado, llaman a los Hooks de datos y pasan la info a los componentes visuales. (Ej: `CreateLeaseForm`, `DashboardMetrics`).

### 3.2 Custom Hooks para Lógica
Nunca escribir lógica compleja dentro del componente. Extraerla a un Hook.
*   *Mal:* Un componente de 200 líneas lleno de `useEffect` y cálculos.
*   *Bien:* `const { rent, total, isOverdue } = useRentCalculation(lease);`

### 3.3 Colocación (Co-location)
Mantener las cosas que cambian juntas, físicamente cerca.
```
src/features/leases/
├── components/    # Componentes exclusivos de Contratos
├── hooks/         # Hooks exclusivos de Contratos
├── services/      # Llamadas API exclusivas de Contratos
└── types.ts       # Tipos exclusivos de Contratos
```

## 4. Reglas de Calidad y Estilo (Linting)

*   **Tipado Estricto (TypeScript):** Prohibido el uso de `any` explícito. Si no sabes el tipo, usa `unknown` y valida.
*   **Inmutabilidad:** Preferir `const` siempre. Evitar mutar objetos o arrays directamente (usar spread operator o métodos inmutables).
*   **Nombres Descriptivos:**
    *   Variables booleanas: `isActive`, `hasAccess`, `canEdit`.
    *   Funciones: Verbo + Sustantivo (`calculateTotal`, `fetchUser`).

## 5. Escalabilidad Horizontal
El backend debe ser **Stateless** (Sin estado). No guardar sesiones en memoria RAM del servidor (usar Redis o JWT). Esto permite que si el SaaS crece, podamos poner 10 servidores backend detrás de un balanceador de carga sin romper nada.
