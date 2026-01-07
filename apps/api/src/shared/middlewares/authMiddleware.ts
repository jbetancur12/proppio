import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requestContext, UserContext } from '../utils/RequestContext';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: 'No authorization header' });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserContext;

        // Validate required fields in the token
        if (!decoded.tenantId || !decoded.userId) {
            res.status(401).json({ message: 'Invalid token payload' });
            return;
        }

        // Wrap the next() call in the AsyncLocalStorage context
        requestContext.run(decoded, () => {
            next();
        });

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};
