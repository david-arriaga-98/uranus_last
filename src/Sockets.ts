import { Server } from 'socket.io';
import { getCoords } from './Controllers/Vehicle/VehicleSocketsController';

export function socket(io: Server) {
	io.on('connection', (socket) => {
		var intervals = setInterval(async () => {
			io.emit('coords', await getCoords());
		}, 3000);

		socket.on('disconnect', () => {
			clearInterval(intervals);
		});
	});
}
