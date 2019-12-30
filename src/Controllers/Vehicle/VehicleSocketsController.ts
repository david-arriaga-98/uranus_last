import { Coord, Vehicle } from '../../Models/Vehicle';
import moment from 'moment';
export async function getCoords() {
	//Buscamos todas las coordenadas que hay en el sistema
	const coords = await Coord.find();

	//Ahora iteramos y buscamos las que tengan mas de 10 segundos
	coords.forEach(async (vehicle: any) => {
		//Validamos que si tiene mas de 5 segundos lo eliminamos y cambiamos el estado
		var actualTime: number = moment()
			.add(-5, 'hours')
			.unix();
		var totalTime: number = actualTime - vehicle.createdAt;
		if (totalTime >= 10) {
			//Lo eliminamos en la base de datos
			await Coord.findByIdAndDelete(vehicle._id);
			//Actualizamos el vehiculo
			await Vehicle.findByIdAndUpdate(vehicle.vehicleID, {
				state: false
			});
		}
	});

	return coords;
}
