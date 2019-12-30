//Aquí vamos a crear los metodos de la compañia
import { Request, Response } from 'express';
import validator from 'validator';
import moment from 'moment';

import { Company } from '../../Models/Company';

import { errorPetitions } from '../../Helpers/Petitions/ErrorMessage';
import Token from '../../Helpers/getToken';
import { User } from '../../Models/User';

//metodo para crear una compañia
export const createCompany = async (req: Request, res: Response) => {
	//Recogemos los datos por post
	var { name, ruc, socialReason, direction } = req.body;
	const admin: any = req.body.user;

	/* OJO LOS MASTER_ADMIN NO PUEDEN TENER COMPAÑIA */
	try {
		//Validamos los datos
		var valName: boolean = !validator.isEmpty(name);
		var valRUC: boolean =
			!validator.isEmpty(ruc) &&
			validator.isInt(ruc) &&
			validator.isLength(ruc, { min: 13, max: 13 });

		if (valName && valRUC) {
			//Validamos si puede crear empresa, solo los admins lo pueden hacer
			if (admin.role === 'ROLE_ADMIN' && admin.company === null) {
				//Validamos que no exista una compañia similar
				const company: any = await Company.findOne({ ruc });
				if (company) {
					res.status(422).json({
						status: 'error',
						message: 'Ya existe una compañía registrada con este ruc'
					});
				} else {
					//Creamos el objeto compañia
					const newCompany: any = new Company({
						name,
						ruc,
						socialReason,
						direction,
						users: admin._id,
						state: false,
						createdAt: moment(),
						companyKey: new Token(30).getUrlToken()
					});
					//Guardamos la compañia en la base de datos
					await newCompany.save();
					//Retornamos una respuesta
					res.status(200).json({
						status: 'success',
						message:
							'Compañia creada correctamente, espera a que esta sea verificada para poder utilizarla'
					});
					//Actualizamos el usuario
					await User.findByIdAndUpdate(admin._id, {
						company: newCompany._id,
						companyState: newCompany.state
					});
				}
			} else {
				res.status(422).json({
					status: 'error',
					message:
						'No puedes crear una compañía, ya has creado una o tu Rol no te lo permite'
				});
			}
		} else {
			res.status(422).json(errorPetitions.fieldError);
		}
	} catch (error) {
		res.status(422).json(errorPetitions.fieldError);
	}
};

//Metodo de admin debe ir en otro documento
export const activeCompany = async (req: Request, res: Response) => {
	//Recogemos los datos
	var { companyID } = req.body;
	const admin = req.body.user;

	try {
		var valID: boolean =
			!validator.isEmpty(companyID) && validator.isMongoId(companyID);

		if (valID) {
			//Buscamos a la compañia en la base de datos
			const company: any = await Company.findById(companyID);
			if (company) {
				//Validamos si ya esta activada o no
				if (company.state === false) {
					//Activamos la compañia
					await Company.findByIdAndUpdate(company._id, {
						state: true
					});
					//Retornamos una respuesta
					res.status(200).json({
						status: 'success',
						message: 'La compañía ha sido activada correctamente'
					});
					//Actualizamos los usuarios
					company.users.forEach(async (user: any) => {
						//Actualizamos a los usaurios
						await User.findByIdAndUpdate(user, {
							companyState: true
						});
					});
				} else {
					res.status(422).json({
						status: 'error',
						message: 'La compañía ya está activada'
					});
				}
			} else {
				res.status(404).json({
					status: 'error',
					message: 'Error, la compañía no existe'
				});
			}
		} else {
			res.status(422).json(errorPetitions.fieldError);
		}
	} catch (error) {
		res.status(422).json(errorPetitions.fieldError);
	}
};
