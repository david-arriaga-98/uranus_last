import { model, Schema } from 'mongoose';

const vehicleSchema = new Schema({
	drivers: [{ type: Schema.Types.ObjectId, default: null, ref: 'Drive' }],
	capacity: Number,
	state: { type: Boolean, default: false },
	company: { type: Schema.Types.ObjectId, ref: 'Company' },
	plaque: String,
	description: String,
	createdAt: { type: Date, default: null },
	updatedAt: { type: Date, default: null }
});

export const Vehicle = model('Vehicle', vehicleSchema);

const coordSchema = new Schema({
	vehicleID: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
	position: Object,
	createdAt: Number
});

export const Coord = model('Coord', coordSchema);
