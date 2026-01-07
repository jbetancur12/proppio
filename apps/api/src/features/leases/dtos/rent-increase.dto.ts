export interface ApplyIncreaseDto {
    leaseId: string;
    newRent: number;
    increasePercentage: number;
    effectiveDate: string; // ISO date
    reason?: string;
}

export interface BulkApplyIncreaseDto {
    increases: ApplyIncreaseDto[];
}

export interface IncreasePreview {
    leaseId: string;
    propertyName: string;
    unitName: string;
    renterName: string;
    currentRent: number;
    suggestedRent: number;
    increasePercentage: number;
    lastIncreaseDate?: Date;
}

export interface IPCConfigDto {
    year: number;
    ipcRate: number;
}
