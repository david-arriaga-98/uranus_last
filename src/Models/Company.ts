import { model, Schema } from 'mongoose';

const companySchema = new Schema({
	name: { type: String, default: null },
	ruc: String,
	socialReason: { type: String, default: '' },
	direction: { type: String, default: '' },
	users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle', default: null }],
	state: { type: Boolean, default: true },
	createdAt: { type: Date, default: null },
	updatedAt: { type: Date, default: null },
	companyKey: String,
	clients: [{ type: Schema.Types.ObjectId, ref: 'Client', default: null }]
});

export const Company = model('Company', companySchema);
