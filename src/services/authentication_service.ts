import pool from '@/config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CreateUserRequest, LoginRequest, User, JWTPayload } from '@/models/user';

export class AuthenticationService {
  static async registerUser(userData: CreateUserRequest): Promise<User> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    
    const queryText = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, profile_picture_url, created_at, updated_at
    `;
    
    const values = [
      userData.username,
      userData.email,
      passwordHash,
      userData.role || 'user'
    ];
    
    const result = await pool.query(queryText, values);
    return {
      ...result.rows[0],
      password_hash: passwordHash
    };
  }
  
  static async loginUser(loginData: LoginRequest): Promise<User | null> {
    const queryText = `
      SELECT * FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(queryText, [loginData.email]);
    const user = result.rows[0];
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password_hash
    );
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }
  
  static generateToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return token;
  }
  
  static async getUserById(id: string): Promise<User | null> {
    const queryText = `
      SELECT * FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(queryText, [id]);
    return result.rows[0] || null;
  }
  
  static async updateUser(id: string, userData: {
    username?: string;
    email?: string;
    password?: string;
    profile_picture_url?: string;
  }): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;
    
    if (userData.username) {
      paramCount++;
      updates.push(`username = $${paramCount}`);
      values.push(userData.username);
    }
    
    if (userData.email) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(userData.email);
    }
    
    if (userData.password) {
      paramCount++;
      const passwordHash = await bcrypt.hash(userData.password, 10);
      updates.push(`password_hash = $${paramCount}`);
      values.push(passwordHash);
    }
    
    if (userData.profile_picture_url) {
      paramCount++;
      updates.push(`profile_picture_url = $${paramCount}`);
      values.push(userData.profile_picture_url);
    }
    
    if (updates.length === 0) {
      throw new Error('No fields to update');
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const queryText = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount + 1}
      RETURNING id, username, email, role, profile_picture_url, created_at, updated_at
    `;
    
    const result = await pool.query(queryText, values);
    return result.rows[0] || null;
  }
}