import { Router } from 'express';

const router: Router = Router();

import {
	createCompany,
	activeCompany
} from '../Controllers/Company/CompanyController';
import { AdminMD } from '../Middlewares/AdminMD';

router.post('/company/create', AdminMD, createCompany);

//Admin
router.post('/company/activate', AdminMD, activeCompany);

export default router;
