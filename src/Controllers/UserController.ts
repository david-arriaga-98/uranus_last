import { Request, Response } from 'express';
import validator from 'validator';
import moment from 'moment';
import jwt from 'jwt-simple';

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
	const admin = req.body.user;
	console.log(admin);

	//Recogemos los datos por post
	var { names, schedule, email, type } = req.body;
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
				//Creamos usuarios dependiendo del rango
				if (admin.role === 'MASTER_ADMIN') {
					//Va a crear solo administradores sin compañias
					//---Creamos el objeto
					const newUser = new User({
						names,
						email,
						password,
						schedule,
						role: 'ROLE_ADMIN',
						createdAt: moment(),
						personalToken: new Token(60).getUrlToken()
					});
					saveUser(newUser, password);
				} else if (admin.role === 'ROLE_ADMIN') {
					if (admin.company === null) {
						res.status(422).json({
							status: 'error',
							message: 'No has creado una compañía'
						});
					} else {
						//Va a poder crear usuarios o administradores

						//---Validamos el tipo de usuario
						var valType =
							!validator.isEmpty(type) &&
							validator.isInt(type) &&
							type >= 0 &&
							type <= 1;

						if (valType) {
							//1 para admin y 0 para usuario
							if (type == 1) {
								const newUser = new User({
									names,
									email,
									password,
									schedule,
									role: 'ROLE_ADMIN',
									company: admin.company,
									createdAt: moment(),
									personalToken: new Token(60).getUrlToken()
								});
								saveUser(newUser, password);
							} else {
								const newUser = new User({
									names,
									email,
									password,
									schedule,
									role: 'ROLE_USER',
									company: admin.company,
									createdAt: moment(),
									personalToken: new Token(60).getUrlToken()
								});
								saveUser(newUser, password);
							}
						} else {
							res.status(422).json({
								status: 'error',
								message: 'Error, no se pudo crear el usuario'
							});
						}
					}
				} else {
					res.status(422).json({
						status: 'error',
						message: 'Error, no puedes realizar estos cambios'
					});
				}

				async function saveUser(user: any, password: any) {
					//Hashear la password
					user.password = await user.encryptPass(user.password);
					//Guardamos al usuario en la base de datos
					await user.save();

					//Enviamos un email
					new SendMail().sendVerifyEmail(user, password);

					res.status(202).json({
						status: 'success',
						message: `El usuario con los nombres ${user.names} ha sido registrado satisfactoriamente`
					});
				}
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
	var applicationCode: string = req.params.code;

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
						//Aquí validamos si esta mandando una application code o no

						var token = new Authorization(user).generateUserToken();

						if (applicationCode != undefined) {
							//Validamos que la clave y la clave enviada sean las mismas
							var code: any = process.env.APPLICATION_CODE;
							if (applicationCode === code) {
								//Aqui generamos todo el usuario
								user.password = undefined;
								//Retornamos el token y el usuario
								res.status(202).json({
									status: 'success',
									token,
									user
								});
							} else {
								res.status(422).json({
									status: 'error',
									message: 'La clave de acceso es incorrecta'
								});
							}
						} else {
							//Aqui generamos parte del usuario
							user.password = undefined;
							user.state = undefined;
							user.createdAt = undefined;
							user.updatedAt = undefined;
							user.email = undefined;
							user.schedule = undefined;
							user.personalToken = undefined;
							user.company = undefined;
							//Retornamos el token y el usuario
							res.status(202).json({
								status: 'success',
								token,
								user
							});
						}
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

export const recoveryPass = async (
	req: Request,
	res: Response
): Promise<void> => {
	//Recogemos los datos por post
	var { credential } = req.body;
	//Buscamos al usuario en la base de datos
	try {
		var valCredetial: boolean = !validator.isEmpty(credential);

		if (valCredetial) {
			//Bucamos al usuario en la base de datos
			const user: any = await User.findOne({
				$or: [{ email: credential }, { schedule: credential }]
			});
			if (user) {
				//Validamos que el usuario no este baneado ni tenga la cuenta inactiva
				if (user.state === false) {
					res.status(422).json({
						status: 'error',
						message: 'El usuario no ha activado su cuenta, verifique su correo'
					});
				} else if (user.role === 'USER_BANNED') {
					res.status(422).json({
						status: 'error',
						message: 'Usuario baneado'
					});
				} else {
					res.status(201).json({
						status: 'error',
						message: 'Se ha enviado a su correo satisfactoriamente'
					});
				}
			} else {
				res.status(404).json({
					status: 'error',
					message: 'El usuario no existe'
				});
			}
		} else {
			res.status(422).json(errorPetitions.fieldError);
		}
	} catch (error) {
		res.status(422).json(errorPetitions.fieldError);
	}
};

export const changePass = async (req: Request, res: Response) => {
	//Recogemos los datos
	var { password, newPass, passwordConf } = req.body;
	var token: any = req.headers.authorization;

	//Validamos los datos
	try {
		var valpass = !validator.isEmpty(password);
		var valNewPass =
			!validator.isEmpty(newPass) &&
			validator.isLength(newPass, { min: 8, max: 255 });
		var valPassConf =
			!validator.isEmpty(passwordConf) &&
			validator.isLength(passwordConf, { min: 8, max: 255 });
		var valToken = !validator.isEmpty(token) && validator.isJWT(token);

		if (valpass && valNewPass && valPassConf && valToken) {
			//Descomponemos el token
			var key: any = process.env.TOKEN_KEY;
			const user = jwt.decode(token, key);

			//Buscamos al usuario en la base de datos
			const findUser: any = await User.findById(user.sub);
			if (findUser) {
				//Validamos que la contraseña sea correcta
				const verifyPass: boolean = await findUser.decryptPass(password);
				if (verifyPass) {
					//Si la contraseña esta bien vamos a generar una nueva
					if (newPass === passwordConf) {
						//Verificamos si la password no es igual a la anterior
						const verifyNewPass: boolean = await findUser.decryptPass(newPass);
						if (verifyNewPass) {
							res.status(400).json({
								status: 'error',
								message: 'Esta contraseña ya está en uso en este momento'
							});
						} else {
							//Hasheamos la password
							var newPassword: any = await findUser.encryptPass(newPass);
							//Actualizamos el usuario
							await User.findByIdAndUpdate(findUser._id, {
								password: newPassword,
								updatedAt: moment()
							});
							res.status(201).json({
								status: 'success',
								message: 'Contraseña actualizada satisfactoriamente'
							});
						}
					} else {
						res.status(422).json({
							status: 'error',
							message: 'Las contraseñas no coinciden'
						});
					}
				} else {
					res.status(422).json({
						status: 'error',
						message: 'La contraseña es incorrecta'
					});
				}
			} else {
				res.status(404).json({
					status: 'error',
					message: 'El usuario no existe'
				});
			}
		} else {
			res.status(422).json(errorPetitions.fieldError);
		}
	} catch (error) {
		res.status(422).json(errorPetitions.fieldError);
	}
};
