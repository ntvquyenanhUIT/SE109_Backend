import { Request, Response } from 'express';
import { AuthenticationService } from '@/services/authentication_service';
import { CreateUserRequest, LoginRequest, AuthResponse } from '@/models/user';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export class AuthenticationController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      
      // Basic validation
      if (!userData.username || !userData.email || !userData.password) {
        res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
        return;
      }
      
      const user = await AuthenticationService.registerUser(userData);
      const token = AuthenticationService.generateToken(user);
      
      res.cookie('jwt_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      const response: AuthResponse = {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile_picture_url: user.profile_picture_url,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        message: 'User registered successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error && error.message.includes('duplicate key')) {
        if (error.message.includes('username')) {
          res.status(409).json({
            success: false,
            message: 'Username already exists'
          });
        } else if (error.message.includes('email')) {
          res.status(409).json({
            success: false,
            message: 'Email already exists'
          });
        } else {
          res.status(409).json({
            success: false,
            message: 'User already exists'
          });
        }
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      
      if (!loginData.email || !loginData.password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }
      
      const user = await AuthenticationService.loginUser(loginData);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }
      
      const token = AuthenticationService.generateToken(user);
      
      res.cookie('jwt_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      const response: AuthResponse = {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile_picture_url: user.profile_picture_url,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        message: 'Login successful'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to login',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }
      
      const user = await AuthenticationService.getUserById(req.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile_picture_url: user.profile_picture_url,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('jwt_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
  
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }
      
      const userData = req.body;
      const updatedUser = await AuthenticationService.updateUser(req.userId, userData);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}