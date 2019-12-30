import { Request, Response, NextFunction, json } from 'express';
import validator from 'validator';
import jwt from 'jwt-simple';

import { User } from '../Models/User';

export const AdminMD = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	//Recogemos el token recibido
	var token: any = req.headers.authorization;
	//Validamos el token
	try {
		var valToken = !validator.isEmpty(token) && validator.isJWT(token);
		if (valToken) {
			//Limpiamos el token
			token = token.replace(/['"]+/g, '');
			//Decodificamos el token
			const key: any = process.env.TOKEN_KEY;
			const tokenValidate = jwt.decode(token, key);

			//Buscamos al usuario en la base de datos a ver si es cierto que es admin
			const user: any = await User.findById(tokenValidate.sub);
			//Validamos
			if (user.state === false) {
				res.status(401).json({
					status: 'error',
					message: 'Tu cuenta no ha sido activado'
				});
			} else if (user.role === 'MASTER_ADMIN' || user.role === 'ROLE_ADMIN') {
				req.body.user = user;
				next();
			} else if (user.role === 'USER_BANNED') {
				res.status(401).json({
					status: 'error',
					message: 'Tu cuenta ha sido baneada'
				});
			} else {
				res.status(401).json({
					status: 'error',
					message: 'No puedes realizar estos cambios'
				});
			}
		} else {
			res.status(401).json({
				status: 'error',
				message: 'Token no válido'
			});
		}
	} catch (error) {
		res.status(401).json({
			status: 'error',
			message: 'Token no válido'
		});
	}
};
