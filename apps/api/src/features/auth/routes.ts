import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login.bind(controller));
// Note: change-password requires auth, but this router is usually public. 
// We will move it to protected routes in app.ts or add middleware here if needed.
// For simplicity, we can export a separate router or just add it here and ensure app.ts mounts it correctly.
// Actually, app.ts mounts '/auth' as public. We need a protected route.
// Let's check app.ts again.


export default router;
