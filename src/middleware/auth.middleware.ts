// Imports core TypeScript type interfaces provided by Express.

// NextFunction is a type that represents the next middleware
// function in the Express request-response cycle. It is used
// to pass control to the next middleware or route handler
// in the execution chain.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


// export interface AuthenticatedRequest extends Request: Creates
// a custom TypeScript interface that inherits every property from
// standard Express Request, but extends it with an extra property.

// user?: { userId: string; role: string; };: Defines an optional (?)
// user object on the request. When a token is successfully verified,
// decoded user payload data (userId and role) is attached here so
// downstream route handlers can access it.
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {

  // req.headers['authorization']: Looks up the Authorization HTTP request
  // header sent by the client (usually formatted like "Bearer <token_string>").
  const authHeader = req.headers['authorization'];

  // authHeader && ...: Uses short-circuit evaluation to ensure
  // authHeader exists before calling string methods on it

  // .split(' ')[1]: Splits the string "Bearer <token>" at the space character
  // into an array ["Bearer", "<token>"] and grabs the element at index 1
  // (the actual JWT string)
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // code 401: unauthorized, meaning the user is not authenticated
    // so authorization in this case is basically authentication(login)
    return res.status(401).json({ message: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';

  // Callback function executed once verification finishes. err holds
  // any verification failure errors, while decoded holds the parsed
  // JSON payload from the token.
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      // code 403: forbidden
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // decoded as... uses TypeScript type assertion to specify the
    // structure of the decoded token payload.
    req.user = decoded as { userId: string; role: string };
    next();
  });
}

// Middleware to restrict access based on user role
export function requireRole(allowedRole: string) {
  // returns an appropriate middleware function that checks the user's role
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      // code 401: unauthorized, meaning the user is not authenticated
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== allowedRole) {
      // code 403: forbidden
      return res.status(403).json({ 
        message: `Forbidden: Requires ${allowedRole} permissions` 
      });
    }
    // else, the user has the required role, so we call next() to pass control
    next();
  };
}

// The factory pattern of the requireRole function creates a middleware
// function dynamically based on the argument passed in. The advantage
// of this is the DRY (Don't Repeat Yourself) principle. One function
// generates the appropriate access control middleware across all roles
// in the system (requireRole('admin'), requireRole('whatever role'))