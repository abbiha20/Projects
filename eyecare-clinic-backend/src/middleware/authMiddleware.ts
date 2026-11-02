import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import sendApiResponse from '../utils/apiResponse';

interface AuthenticatedRequest extends Request {
     user?: {
          id: number;
          username: string;
          userId: Number,
          role: string;
     };
}

const authenticateToken = (expectedRoles: string[]) => (
     req: AuthenticatedRequest,
     res: Response,
     next: NextFunction
) => {
     let token = req.header('Authorization');

     if (!token) {
          return sendApiResponse(res, 'Unauthorized', null, 'Unauthorized', 401);
     }

     token = token.replace(/^Bearer\s/, '');

     try {
          const decoded = jwt.verify(token, process.env.JWT_SECRETKEY as Secret) as {
               id: number;
               username: string;
               userId: Number,
               role: string;
          };

          if (!decoded) {
               throw new Error('Invalid token payload');
          }

          if (!decoded.role || !expectedRoles.includes(decoded.role)) {
               return sendApiResponse(res, 'Forbidden - Insufficient Role', null, 'Forbidden - Insufficient Role', 403);
          }

          req.user = {
               id: decoded.id,
               username: decoded.username,
               userId: decoded.userId,
               role: decoded.role,
          };

          next();
     } catch (error) {
          return sendApiResponse(res, 'Forbidden', null, 'Forbidden', 403);
     }
};

export default authenticateToken;