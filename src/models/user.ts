export interface User {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'user';
    profile_picture_url?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    password?: string;
    profile_picture_url?: string;
}

export interface AuthResponse {
    success: boolean;
    user: Omit<User, 'password_hash'>;
    message: string;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}