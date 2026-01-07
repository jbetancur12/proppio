# ESPECIFICACIÓN FUNCIONAL: RENT MANAGER SAAS

**Propósito:** Definir el modelo de dominio y funcionalidades clave para la gestión de propiedades inmobiliarias, integrando la arquitectura Multi-Tenant ya definida.

## 1. Modelo de Dominio de Propiedades (The Asset Inventory)
Para soportar la variedad de inmuebles (Casa, Edificio, Local, Apartaestudio), utilizaremos un patrón de **Composición Jerárquica**.

### 1.1 Entidades Principales
*   **Property (Inmueble Padre):** Representa la ubicación física principal.
    *   *Tipos:* `SINGLE_UNIT` (Casa unifamiliar), `MULTI_UNIT` (Edificio, Casa con apartaestudios), `COMMERCIAL` (Centro comercial o local único).
    *   *Datos:* Dirección, Ciudad, Estrato, Cédula Catastral, Dueño (Propietario real, no el usuario del sistema necesariamente).
*   **Unit (Unidad Arrendable):** El espacio indivisible que se alquila.
    *   *Relación:* Pertenece a una `Property`.
    *   *Tipos:* `APARTMENT`, `HOUSE`, `COMMERCIAL_LOCAL`, `STUDIO`, `PARKING`.
    *   *Datos:* Identificador (Apt 301), Canon Base, Estado (`VACANT`, `OCCUPIED`, `MAINTENANCE`), Área (m²).

### 1.2 Ejemplos de Estructura
1.  **Casa Unifamiliar:** 1 `Property` (Type: SINGLE) -> 1 `Unit`.
2.  **Edificio Residencial:** 1 `Property` (Type: MULTI) -> N `Units` (Aptos) + N `Units` (Locales en primer piso).
3.  **Casa con Apartaestudios:** 1 `Property` (Type: MULTI) -> N `Units` (Studios).

## 2. Gestión de Arrendamientos (Lease Lifecycle)
El corazón operacional del sistema.

### 2.1 El Contrato (LeaseContract)
*   **Estados:** `DRAFT` (Borrador), `ACTIVE` (Vigente), `EXPIRING` (Próximo a vencer), `TERMINATED` (Finalizado).
*   **Datos Clave:**
    *   `tenant_id` (Relación con inquilino).
    *   `unit_id` (Relación con la unidad).
    *   `start_date`, `end_date`.
    *   `duration_value` (Duración numérica, ej: 12).
    *   `duration_unit` (Unidad de tiempo: `MONTHS`, `YEARS`).
    *   `minimum_stay_months` (Tiempo mínimo de permanencia antes de penalidad).
    *   `rent_amount` (Valor canon).
    *   `deposit_amount` (Depósito/Fianza).
    *   `payment_day` (Día de corte, ej: los 5 de cada mes).
    *   `increase_clause` (Regla de aumento: IPC + Puntos o Valor Fijo).

### 2.2 Funcionalidades Críticas
*   **Alertas de Vencimiento:** Notificar X días antes del fin de contrato.
*   **Aumentos de Canon:** Asistente para calcular y aplicar el aumento anual.
*   **Manejo de Depósitos:** Registro del ingreso del dinero y su eventual devolución o uso para reparaciones.

### 2.3 Gestión Avanzada de Contratos
*   **Renovaciones Automáticas:** Configuración de alertas (ej: 60 días antes) y generación automática de la propuesta de renovación con el incremento del IPC o pactado.
*   **Indexación (Ajustes de Canon):** Módulo para calcular aumentos basados en índices económicos (IPC) o porcentajes fijos anuales.
*   **Terminación y Liquidación:** Flujo guiado para la finalización del contrato, incluyendo la inspección de salida y el cruce de cuentas con el depósito.

## 3. Finanzas y Contabilidad (Ledger)
Sistema de partida simple o doble simplificada para propietarios.

### 3.1 Transacciones (Transaction)
*   **Tipos:** `INCOME` (Ingreso), `EXPENSE` (Gasto).
*   **Categorías:**
    *   *Ingresos:* Renta Mensual, Multas, Depósito, Parqueadero Extra.
    *   *Gastos:* Mantenimiento, Impuestos, Servicios Públicos (Variables), Comisión Inmobiliaria, Reparaciones.
*   **Servicios Públicos Variables:** Capacidad de registrar facturas globales (ej: Agua de todo el edificio) y prorratear o asignar cobros específicos a unidades individuales.
*   **Métodos de Pago:** `CASH` (Efectivo), `BANK_TRANSFER` (Transferencia), `CONSIGNMENT` (Consignación), `CHECK` (Cheque), `PLATFORM` (Pasarela de pagos).
*   **Soporte de Pago:** Campo para adjuntar foto/PDF del comprobante (necesario para Transferencias/Consignaciones) y validación de "Pendiente" a "Aprobado".
*   **Conciliación:** Marcar si el pago ya entró efectivamente al banco (`IS_CONCILIATED`).

### 3.2 Estados de Cuenta
*   **Por Propiedad:** ¿Cuánto deja el "Edificio Mónaco" al mes?
*   **Por Propietario:** Si administras bienes de terceros, liquidación mensual para pagarles.

## 4. Mantenimiento y Operaciones
*   **Ticket de Mantenimiento:**
    *   Reportado por: Inquilino o Administrador.
    *   Estados: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `BILLED`.
    *   Evidencia: Fotos del daño (Antes/Después).
    *   Costos: Se convierten automáticamente en un `EXPENSE` asociado a la unidad.

## 5. Inquilinos (Occupants) y Portal
*   **Portal del Inquilino:** Web app móvil donde pueden:
    *   Ver su estado de cuenta y descargar recibos.
    *   Reportar daños (Tickets) con fotos desde el celular.
    *   Consultar su contrato y reglamento de propiedad horizontal.
    *   *(Futuro)* Pagar en línea (Pasarela de pagos).
*   **Onboarding Digital:** Formulario para nuevos inquilinos donde cargan su documentación (Cédula, extractos) y que pasa a validación del administrador.
*   **Perfil:** Datos personales, codeudores, referencias, historial de pagos.

## 6. Módulos del Sistema SaaS (Feature Map)

| Módulo | Funcionalidades |
| :--- | :--- |
| **Inventario Inmueble** | Crear Propiedades/Unidades, subir fotos, asignar dueños. |
| **Inventario Mueble** | Inventario de enseres (camas, neveras) para apartaestudios/amoblados con control de estados (Nuevo, Bueno, Malo). |
| **CRM Inquilinos** | Base de datos de inquilinos, codeudores, historial. |
| **Contratos** | Generador de contratos, renovación, terminación, gestión de depósitos. |
| **Finanzas** | Registro de pagos, recibos de caja, control de morosos. |
| **Mantenimiento** | Gestión de tickets, asignación de proveedores (plomeros, etc.). |
| **Proveedores** | Directorio de técnicos (plomeros, electricistas), cotizaciones y cuentas de cobro. |
| **Analytics/KPIs** | Dashboard con Ocupación %, Flujo de Caja neto, Rentabilidad por propiedad, Tasa de morosidad. |

## 7. Flujos de Usuario Clave (User Journeys)
1.  **Onboarding de Propiedad:** Usuario crea "Edificio Central", define que tiene 10 aptos, configura el canon de cada uno.
2.  **Nuevo Arrendamiento:** Usuario selecciona "Apto 202", asigna al inquilino "Juan Perez", define fechas y valor. El sistema marca la unidad como `OCCUPIED`.
3.  **Cobro Mensual:** El sistema genera automáticamente las "Facturas/Cuentas de Cobro" el día de corte. El usuario registra el pago cuando el inquilino consigna.
4.  **Desocupación:** Checklist de salida (inventario), cruce de depósito contra daños, liberación de la unidad a `VACANT`.
