import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../dtos/auth.dto';

export class AuthController {
    private service = new AuthService();

    async login(req: Request, res: Response) {
        try {
            const validation = loginSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ errors: validation.error.errors });
                return;
            }

            const result = await this.service.login(validation.data);
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
}
