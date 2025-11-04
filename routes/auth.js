import express from 'express';
import { register, login, logout, getCurrentUser } from '../controller/auth.js';
import isAuthenticated from '../middlewares/isauthenticated.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', isAuthenticated, getCurrentUser);

export default router;