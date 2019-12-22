import app from './app';

async function main() {
	try {
		await app.listen(app.get('port'));
		console.log('Server on port:', app.get('port'));
	} catch (error) {
		console.log('Error in the server:', error);
	}
}

main();
