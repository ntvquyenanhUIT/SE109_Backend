import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/models/user';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  user?: any;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const tokenFromCookie = req.cookies?.jwt_token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];
    console.log('Token from cookie:', tokenFromCookie);
    console.log('Token from header:', tokenFromHeader);
    const token = tokenFromCookie || tokenFromHeader;
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }
    
    res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
    return;
  }
  
  next();
};
