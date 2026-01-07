import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error('❌ No JWT_SECRET found in .env');
    process.exit(1);
}

const tenantId = process.argv[2] || v4();
const userId = process.argv[3] || v4();
const role = process.argv[4] || 'owner';

const payload = {
    tenantId,
    userId,
    role
};

const token = jwt.sign(payload, secret, { expiresIn: '1y' });

console.log('🔑 Token Generated!');
console.log('---------------------------------------------------');
console.log(`Tenant ID: ${tenantId}`);
console.log(`User ID:   ${userId}`);
console.log(`Role:      ${role}`);
console.log('---------------------------------------------------');
console.log(token);
console.log('---------------------------------------------------');
console.log('⚠️  Copy this token and use it in the Authorization header: Bearer <token>');
