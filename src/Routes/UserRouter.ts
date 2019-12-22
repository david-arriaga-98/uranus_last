import { Router } from 'express';

const router: Router = Router();

//----Middlewares---//
import { AdminMD } from '../Middlewares/AdminMD';

//----Usuarios---//
import {
	registerUser,
	loginUser,
	activateAccount
} from '../Controllers/UserController';

router.post('/user/register', AdminMD, registerUser);
router.post('/user/login', loginUser);

router.get('/user/verify/:token', activateAccount);

export default router;
