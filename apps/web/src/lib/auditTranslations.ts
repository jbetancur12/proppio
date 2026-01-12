/**
 * Translate audit log action names from English enums to Spanish
 */
export function translateAuditAction(action: string): string {
    const translations: Record<string, string> = {
        // Authentication
        LOGIN: 'Iniciar Sesión',
        LOGOUT: 'Cerrar Sesión',
        REGISTER: 'Registrarse',

        // Leases
        CREATE_LEASE: 'Crear Contrato',
        UPDATE_LEASE: 'Actualizar Contrato',
        DELETE_LEASE: 'Eliminar Contrato',
        ACTIVATE_LEASE: 'Activar Contrato',
        TERMINATE_LEASE: 'Terminar Contrato',
        DELETE_LEASE_CONTRACT: 'Eliminar PDF de Contrato',

        // Properties
        CREATE_PROPERTY: 'Crear Propiedad',
        UPDATE_PROPERTY: 'Actualizar Propiedad',
        DELETE_PROPERTY: 'Eliminar Propiedad',

        // Units
        CREATE_UNIT: 'Crear Unidad',
        UPDATE_UNIT: 'Actualizar Unidad',
        DELETE_UNIT: 'Eliminar Unidad',

        // Renters
        CREATE_RENTER: 'Crear Inquilino',
        UPDATE_RENTER: 'Actualizar Inquilino',
        DELETE_RENTER: 'Eliminar Inquilino',

        // Payments
        CREATE_PAYMENT: 'Crear Pago',
        UPDATE_PAYMENT: 'Actualizar Pago',
        DELETE_PAYMENT: 'Eliminar Pago',
        REGISTER_PAYMENT: 'Registrar Pago',

        // Expenses
        CREATE_EXPENSE: 'Crear Gasto',
        UPDATE_EXPENSE: 'Actualizar Gasto',
        DELETE_EXPENSE: 'Eliminar Gasto',

        // Tenants (Admin)
        CREATE_TENANT: 'Crear Tenant',
        UPDATE_TENANT: 'Actualizar Tenant',
        DELETE_TENANT: 'Eliminar Tenant',
        UPDATE_TENANT_STATUS: 'Actualizar Estado de Tenant',
        UPDATE_TENANT_CONFIG: 'Actualizar Configuración de Tenant',

        // Users
        CREATE_USER: 'Crear Usuario',
        UPDATE_USER: 'Actualizar Usuario',
        DELETE_USER: 'Eliminar Usuario',

        // Contract Templates
        CREATE_TEMPLATE: 'Crear Plantilla',
        UPDATE_TEMPLATE: 'Actualizar Plantilla',
        DELETE_TEMPLATE: 'Eliminar Plantilla',

        // Exit Notices
        CREATE_EXIT_NOTICE: 'Crear Aviso de Salida',
        CONFIRM_EXIT_NOTICE: 'Confirmar Aviso de Salida',
        CANCEL_EXIT_NOTICE: 'Cancelar Aviso de Salida',

        // Rent Increases
        APPLY_RENT_INCREASE: 'Aplicar Aumento de Canon',
        BULK_APPLY_INCREASES: 'Aplicar Aumentos Masivos',
        SET_IPC: 'Configurar IPC',
    };

    return translations[action] || action;
}

/**
 * Translate resource type names from English to Spanish
 */
export function translateResourceType(resourceType: string): string {
    const translations: Record<string, string> = {
        Lease: 'Contrato',
        Property: 'Propiedad',
        Unit: 'Unidad',
        Renter: 'Inquilino',
        Payment: 'Pago',
        Expense: 'Gasto',
        Tenant: 'Tenant',
        User: 'Usuario',
        Template: 'Plantilla',
        ExitNotice: 'Aviso de Salida',
    };

    return translations[resourceType] || resourceType;
}
