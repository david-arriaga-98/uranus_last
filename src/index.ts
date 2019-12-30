import app from './app';
import SocketIO from 'socket.io';
import http from 'http';

const server = http.createServer(app);
const io = SocketIO(server);

import { socket } from './Sockets';
socket(io);

server.listen(app.get('port'), () => {
	console.log('Socket on port', app.get('port'));
});
