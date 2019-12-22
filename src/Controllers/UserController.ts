import { Request, Response } from 'express';
import validator from 'validator';
import moment from 'moment';

import { User } from '../Models/User';

import Token from '../Helpers/getToken';
import SendMail from '../Helpers/sendEmail';
import { errorPetitions } from '../Helpers/Petitions/ErrorMessage';
import Authorization from '../Helpers/Authorization';

export const validateSchedule = async (
	req: Request,
	res: Response
): Promise<void> => {
	//Recogemos la cédula
	var { schedule } = req.body;
	//Validamos la cédula
	try {
		var valSchedule: boolean =
			!validator.isEmpty(schedule) &&
			validator.isLength(schedule, { min: 10, max: 10 }) &&
			validator.isInt(schedule);
		if (valSchedule) {
			//Validamos que no exista la cedula en la base de datos
			const user: any = await User.findOne({ $and: [{ schedule }] });
			if (user) {
				res.status(422).json({
					status: 'error',
					message: 'Ya existe un usuario con esta cédula'
				});
			} else {
				//Hacemos una busqueda por medio del api
			}
		}
	} catch (error) {}
};

export const registerUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	//Recogemos los datos por post
	var { names, schedule, email } = req.body;

	//Validamos los datos
	try {
		var valSchedule: boolean =
			!validator.isEmpty(schedule) &&
			validator.isLength(schedule, { min: 10, max: 10 }) &&
			validator.isInt(schedule);
		var valEmail: boolean =
			!validator.isEmpty(email) && validator.isEmail(email);
		var valNames: boolean = !validator.isEmpty(names);

		if (valSchedule && valEmail && valNames) {
			//Validamos que el usuario no exista
			const user: any = await User.findOne({
				$or: [{ schedule }, { email }]
			});
			if (user) {
				res.status(422).json({
					status: 'error',
					message: 'El usuario con uno o varios parámetros, ya existe'
				});
			} else {
				var password: string = new Token(8).getUrlToken().toUpperCase();
				//Generamos el objeto
				const newUser: any = new User({
					names,
					email,
					password,
					schedule,
					role: 'MASTER_ADMIN',
					createdAt: moment(),
					personalToken: new Token(60).getUrlToken()
				});

				//Hashear la password
				newUser.password = await newUser.encryptPass(newUser.password);
				//Guardamos al usuario en la base de datos
				await newUser.save();

				//Enviamos un email
				new SendMail().sendVerifyEmail(newUser, password);

				res.status(202).json({
					status: 'success',
					message: `El usuario con los nombres ${newUser.names} ha sido registrado satisfactoriamente`
				});
			}
		} else {
			res.status(422).json(errorPetitions.fieldError);
		}
	} catch (error) {
		res.status(422).json(errorPetitions.fieldError);
	}
};

export const activateAccount = async (
	req: Request,
	res: Response
): Promise<void> => {
	//Recogemos el urlToken
	var token: string = req.params.token;

	//Validamos
	try {
		var valToken =
			!validator.isEmpty(token) &&
			validator.isLength(token, { min: 60, max: 60 });

		if (valToken) {
			//Buscamos al token en la base de datos
			const user: any = await User.findOne({ personalToken: token });
			if (user) {
				//Activamos al usuario
				await User.findByIdAndUpdate(user._id, {
					state: true,
					personalToken: new Token(32).getUrlToken()
				});
				res.status(201).json({
					status: 'success',
					message: `Felicidades ${user.names}, tu cuenta ha sido activada satisfactoriamente`
				});
			} else {
				res.status(404).json({
					status: 'error',
					message: 'El código es erroneo, o el usuario ya está validado'
				});
			}
		} else {
			res.status(404).json({
				status: 'error',
				message: 'El código es erroneo, o el usuario ya está validado'
			});
		}
	} catch (error) {
		res.status(422).json(errorPetitions.fieldError);
	}
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
	//Recibimos los datos
	var { credential, password } = req.body;

	//Validamos los datos
	try {
		var valCredetial = !validator.isEmpty(credential);
		var valPassword = !validator.isEmpty(password);

		if (valCredetial && valPassword) {
			//Buscamos al usuario en la base de datos
			const user: any = await User.findOne({
				$or: [{ email: credential }, { schedule: credential }]
			}).select('-__v');

			if (user) {
				if (user.state === false) {
					res.status(422).json({
						status: 'error',
						message: 'Cuenta inactiva'
					});
				} else if (user.role === 'USER_BANNED') {
					res.status(422).json({
						status: 'error',
						message: 'Cuenta Baneada'
					});
				} else {
					//Comparamos la contraseña
					const verifyPass: boolean = await user.decryptPass(password);

					if (verifyPass) {
						//Si es verdadero, entonces generamos el token
						var token = new Authorization(user).generateUserToken();

						//Eliminamos cosas sencibles
						user.password = undefined;
						user.state = undefined;
						user.createdAt = undefined;
						user.updatedAt = undefined;
						user.email = undefined;
						user.schedule = undefined;
						user.personalToken = undefined;
						user.company = undefined;
						//Retornamos el token
						res.status(202).json({
							status: 'success',
							token,
							user
						});
					} else {
						res.status(400).json(errorPetitions.credentialsError);
					}
				}
			} else {
				res.status(400).json(errorPetitions.credentialsError);
			}
		} else {
			res.status(422).json(errorPetitions.fieldError);
		}
	} catch (error) {
		res.status(422).json(errorPetitions.fieldError);
	}
};
