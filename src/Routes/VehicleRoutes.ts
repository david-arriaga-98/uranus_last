import { Router } from 'express';

const router: Router = Router();

import { AdminMD } from '../Middlewares/AdminMD';
import {
	createVehicle,
	sendCoordsToTheServer
} from '../Controllers/Vehicle/VehicleController';

router.post('/vehicle/create', AdminMD, createVehicle);

//Coordenadas a enviar
router.get('/vehicle/coords/:key/:idVehicle/:lat/:lng', sendCoordsToTheServer);

export default router;
