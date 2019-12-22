import mongoose from 'mongoose';

export async function connectDB() {
	try {
		const URI: string =
			'mongodb+srv://david:david9812@cluster0-vciof.mongodb.net/uranus?retryWrites=true&w=majority';
		await mongoose.connect(URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false
		});
		console.log('>>>DB is connect');
	} catch (error) {
		console.log('Error: ', error);
	}
}
