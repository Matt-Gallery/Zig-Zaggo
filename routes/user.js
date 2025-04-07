import { Router } from 'express';
import { getAccount, updateProfile, deleteAccount } from '../controllers/user.js';
import isSignedIn from '../middleware/isSignedIn.js';

const router = Router();

router.get('/account', isSignedIn, getAccount);
router.post('/update-profile', isSignedIn, updateProfile);
router.post('/delete-account', isSignedIn, deleteAccount);

export default router;