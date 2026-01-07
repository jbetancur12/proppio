import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import { LoginDto } from '../dtos/auth.dto';

export class AuthService {
    async login(dto: LoginDto) {
        // MOCK LOGIN FOR NOW -> In real world, check DB
        // We will simulate a "Super Admin" only for specific email

        if (dto.email === 'admin@demo.com' && dto.password === '123456') {
            const payload = {
                tenantId: v4(), // Random tenant for demo
                userId: v4(),
                role: 'owner'
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' });
            return { token, user: payload };
        }

        throw new Error('Invalid credentials');
    }
}
