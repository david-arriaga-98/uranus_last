import { Router } from 'express';

const router: Router = Router();

//----Middlewares---//
import { AdminMD } from '../Middlewares/AdminMD';

//----Usuarios---//
import {
	registerUser,
	loginUser,
	activateAccount,
	recoveryPass,
	changePass
} from '../Controllers/UserController';

router.post('/user/register', AdminMD, registerUser);
router.post('/user/login/:code?', loginUser);
router.post('/user/recovery', recoveryPass);
router.get('/user/verify/:token', activateAccount);

router.post('/user/change/pass', changePass);

export default router;
