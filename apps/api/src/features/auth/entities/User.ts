import { Entity, Property, Enum } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/entities/BaseEntity';

export enum GlobalRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    USER = 'USER',
}

@Entity({ tableName: 'users' })
export class User extends BaseEntity {
    @Property({ type: 'string', unique: true })
    email!: string;

    @Property({ type: 'string' })
    passwordHash!: string;

    @Property({ type: 'string', nullable: true })
    firstName?: string;

    @Property({ type: 'string', nullable: true })
    lastName?: string;

    @Enum(() => GlobalRole)
    globalRole: GlobalRole = GlobalRole.USER;

    constructor(partial?: Partial<User>) {
        super();
        Object.assign(this, partial);
    }
}
