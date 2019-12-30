import { Request, Response } from 'express';

import { Vehicle, Coord } from '../../Models/Vehicle';
import { Company } from '../../Models/Company';

import validator from 'validator';
import moment = require('moment');

export const createVehicle = async (req: Request, res: Response) => {
	//Recogemos los datos por post
	var { plaque, capacity, description } = req.body;
	const admin = req.body.user;
	//Validamos los datos
	try {
		var valplaque: boolean = !validator.isEmpty(plaque);
		var valCapacity: boolean =
			!validator.isEmpty(capacity) && validator.isInt(capacity);

		if (valplaque && valCapacity) {
			//Validamos que no haya la placa repetida
			const vehicle = await Vehicle.findOne({ plaque });
			if (vehicle) {
				res.status(422).json({
					status: 'error',
					message: 'Ya existe un vehículo con esta misma placa'
				});
			} else {
				//Validamos que el master admin no sea quien cree los vehiculos
				if (admin.role != 'ROLE_ADMIN') {
					res.status(422).json({
						status: 'error',
						message: 'Tu rango no te permite realizar esta operación'
					});
				} else {
					//Validamos que si tenga una compañia
					if (admin.company === null) {
						res.status(422).json({
							status: 'error',
							message: 'Debes crear una compañía para poder agregar vehículos'
						});
					} else {
						//Validamos la compañia
						if (admin.companyState === true) {
							//Creamos el objeto
							const newVehicle = new Vehicle({
								capacity,
								company: admin.company,
								plaque,
								description,
								createdAt: moment()
							});
							//Guardamos el vehiculo en la base de datos y actualizamos
							await newVehicle.save();
							res.status(200).json({
								status: 'success',
								message: 'Has agregado un vehículo satisfactriamente'
							});
							await Company.findByIdAndUpdate(admin.company, {
								$push: { vehicles: newVehicle._id }
							});
						} else {
							res.status(400).json({
								status: 'error',
								message:
									'No puedes crear un vehículo, no tienes una compañía o esta está desactivada'
							});
						}
					}
				}
			}
		} else {
			res.status(400).json({
				status: 'error',
				message: 'Error al validar los datos, ingreselos nuevamente'
			});
		}
	} catch (error) {
		res.status(400).json({
			status: 'error',
			message: 'Error, Faltan datos por enviar'
		});
	}
};

export const sendCoordsToTheServer = async (req: Request, res: Response) => {
	//Recogemos los datos
	var key: string = req.params.key;
	var idVehicle: string = req.params.idVehicle;
	var lat: any = req.params.lat;
	var lng: any = req.params.lng;

	const keyApp = process.env.APPLICATION_CODE;

	//Validamos los datos
	try {
		var valKey: boolean =
			!validator.isEmpty(key) &&
			validator.isLength(key, { min: 40, max: 40 }) &&
			validator.isHexadecimal(key) &&
			key === keyApp;
		var valVehicle: boolean =
			!validator.isEmpty(idVehicle) && validator.isMongoId(idVehicle);
		var valLat: boolean = !validator.isEmpty(lat) && validator.isDecimal(lat);
		var valLng: boolean = !validator.isEmpty(lng) && validator.isDecimal(lng);

		if (valKey && valVehicle && valLat && valLng) {
			//Validamos que el vehiculo exista
			const vehicle = await Vehicle.findById(idVehicle);
			if (vehicle) {
				//Buscamos si existe en la base de datos
				const coords = await Coord.findOne({ vehicleID: idVehicle });
				if (coords) {
					const update = await Coord.findByIdAndUpdate(
						coords._id,
						{
							position: {
								lat: parseFloat(lat),
								lng: parseFloat(lng)
							},
							createdAt: moment()
								.add(-5, 'hours')
								.unix()
						},
						{ new: true }
					);
					res.status(200).json({
						status: 'success',
						message: 'Datos recibidos correctamente',
						update
					});
				} else {
					const create = new Coord({
						vehicleID: idVehicle,
						position: {
							lat: parseFloat(lat),
							lng: parseFloat(lng)
						},
						createdAt: moment()
							.add(-5, 'hours')
							.unix()
					});
					create.save();
					res.status(200).json({
						status: 'success',
						message: 'Datos recibidos correctamente',
						create
					});
					//Actualizamos el vehculo y le cambiamos el estado
					await Vehicle.findByIdAndUpdate(vehicle._id, {
						state: true
					});
				}
			} else {
				res.status(404).json({
					status: 'error',
					message: 'Error, el vehículo no existe'
				});
			}
		} else {
			res.status(422).json({
				status: 'error',
				message: 'Error al validar tus datos'
			});
		}
	} catch (error) {
		res.status(422).json({
			status: 'error',
			message: 'Error, faltan datos por enviar'
		});
	}
};
