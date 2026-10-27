import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from './auth.service.js';

export async function registerHandler(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      // code 400 indicates a bad request, which is appropriate for missing required fields
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      // code 409 indicates a conflict, which is appropriate for an already registered email
      return res.status(409).json({ message: 'Email already registered' });
    }

    // saltRounds is the cost factor for hashing the password. A higher
    // number means more security but also more processing time. 10 is a
    // common default value.
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser(email, passwordHash, firstName, lastName);

    // code 201 indicates that a new resource has been created successfully
    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (err) {
    console.error('Register error:', err);
    // code 500 indicates an internal server error
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      // code 400 indicates a bad request, which is appropriate for missing required fields
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // code 401 indicates unauthorized access, which is appropriate for invalid credentials
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // code 401 indicates unauthorized access, which is appropriate for invalid credentials
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    // jwt.sign creates a new JSON Web Token. The payload includes
    // the user's ID and role, and the token is signed with a secret
    // key. The token will expire in 24 hours, which is a common
    // practice for session management.
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    // code 200 indicates a successful response
    // returns the token and user information in the response body
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}