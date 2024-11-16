import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

export const jwtAuth = passport.authenticate('jwt', { session: false });

// Middleware to extract user information and attach it to req.user
export const extractUser = (req: Request, res: Response, next: NextFunction): void => {
  // Step 1: Check if Passport has already authenticated the user
  if (req.isAuthenticated()) {
    // Passport has attached the user to req.user
    return next();
  }

  // Step 2: Check for a token in the Authorization header (for next-auth tokens)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      // Verify the JWT token (for next-auth tokens)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      // Attach the decoded user information to req.user
      req.user = decoded as any;
      return next();
    } catch (error) {
      console.error('Token verification failed:', error);
       res.status(401).json({ message: 'Invalid token' })
       return;
    }
  }

  // If no token is found and Passport has not authenticated the user, return an error
   res.status(401).json({ message: 'Unauthorized: No token provided' })
   return;
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;  

    if (!user) {
      res.status(401).json({ message: 'Unauthorized: No user found' });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
      return;
    }

    next();  
  };
};
