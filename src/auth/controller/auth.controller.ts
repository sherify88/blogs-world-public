import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import axios from 'axios';
import { findOrCreateGoogleUser } from '../../users/services/users.services';

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: Error, user: any, info: any) => {
    if (err || !user) {
      return res.status(400).json({ message: info?.message || 'Login failed', user });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '720h' }
    );

    return res.status(200).json({ message: 'Logged in successfully', id: user.id,imageUrl:user.imageUrl, email: user.email, name: user.firstName + ' ' + user.lastName, role: user.role, token });
  })(req, res, next);
};


export const googleLogin: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('Google login request:', req.body);
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ message: 'Google token is required' });
    return;
  }

  try {
    console.log('0002')
    // Step 1: Use Google `userinfo` endpoint to get user data
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log({code:'0003',data: response.data})
    
    const { sub: googleId, email, name } = response.data;
    console.log({code:'0004',googleId,email,name})
    
    if (!googleId || !email) {
      res.status(400).json({ message: 'Invalid Google token' });
      return;
    }
    
    console.log({code:'0005'})
    // Step 2: Find or create the user in your database
    const user = await findOrCreateGoogleUser({ googleId, email, name });
    console.log({code:'0006'})
    console.log('Google login user:', user);

    if (!user) {
      res.status(400).json({ message: 'Failed to authenticate user' });
      return;
    }

    // Step 3: Generate a JWT token for your own authentication
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '720h' }
    );

    // Step 4: Return the user data along with the JWT token
    res.status(200).json({
      message: 'Logged in successfully with Google',
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      image: user.imageUrl,
      role: user.role,
      token: jwtToken,
    });
    return;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Google login error:', error.response?.data || error.message);
    } else {
      console.error('Google login error:', (error as Error).message);
    }
    res.status(401).json({ message: 'Failed to verify Google token' });
    return;
  }
};