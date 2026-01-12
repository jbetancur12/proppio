export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
export type LeaseStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CHECK' | 'CARD' | 'OTHER';
export type ExpenseCategory = 'MAINTENANCE' | 'REPAIRS' | 'UTILITIES' | 'TAXES' | 'MANAGEMENT' | 'INSURANCE' | 'OTHER';
export type ExpenseStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface Unit {
    id: string;
    name: string;
    status: UnitStatus;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    baseRent?: number;
    propertyId?: string;
    propertyName?: string; // Sometimes populated
}

export interface Property {
    id: string;
    name: string;
    address: string;
    units?: Unit[];
}

export interface Renter {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    identification: string;
}

export interface Lease {
    id: string;
    unit: {
        id: string;
        name: string;
        property?: {
            id: string;
            name: string;
        };
    };
    renter:
        | Renter
        | {
              id: string;
              firstName: string;
              lastName: string;
              email?: string;
              phone?: string;
          };
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit?: number;
    status: LeaseStatus;
    notes?: string;
    contractPdfPath?: string;
}

export interface Payment {
    id: string;
    lease: {
        id: string;
        unit: { id: string; name: string };
        renter: { id: string; firstName: string; lastName: string };
    };
    amount: number;
    paymentDate: string;
    periodStart: string;
    periodEnd: string;
    method: PaymentMethod;
    status: PaymentStatus;
    reference?: string;
    notes?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: ExpenseCategory;
    status: ExpenseStatus;
    property: { id: string; name: string };
    unit?: { id: string; name: string };
    supplier?: string;
    invoiceNumber?: string;
}
