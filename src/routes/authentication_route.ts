import express from 'express';
import { AuthenticationController } from '@/controllers/authentication_controller';
import { authenticateToken } from '@/middleware/authentication_middleware';
import { uploadImage } from '@/middleware/upload_middleware';

const router = express.Router();

router.post('/register', AuthenticationController.register);
router.post('/login', AuthenticationController.login);
router.post('/logout', AuthenticationController.logout);

router.get('/profile', authenticateToken, AuthenticationController.getProfile);
router.put('/profile', authenticateToken, uploadImage.single('profilePicture'), AuthenticationController.updateProfile);

export default router;