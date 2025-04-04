import { Router } from 'express';
import { getAccount, updateProfile } from '../controllers/user.js';
import isSignedIn from '../middleware/isSignedIn.js';

const router = Router();

router.get('/account', isSignedIn, getAccount);
router.post('/update-profile', isSignedIn, updateProfile);

export default router;