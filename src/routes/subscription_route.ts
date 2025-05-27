import express from 'express';
import { SubscriptionController } from '@/controllers/subscription_controller';
import { authenticateToken, requireAdmin } from '@/middleware/authentication_middleware';

const router = express.Router();

router.post('/subscribe', authenticateToken, SubscriptionController.subscribe);

router.delete('/unsubscribe', authenticateToken, SubscriptionController.unsubscribe);

router.get('/status', authenticateToken, SubscriptionController.checkSubscriptionStatus);

router.post('/send-notification', authenticateToken, requireAdmin, SubscriptionController.sendNewsletterNotification);

export default router;