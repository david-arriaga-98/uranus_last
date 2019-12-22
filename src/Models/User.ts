import { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema: Schema = new Schema({
	names: String,
	email: String,
	password: String,
	schedule: String,
	role: String,
	state: { type: Boolean, default: false },
	company: { type: Schema.Types.ObjectId, ref: 'Company', default: null },
	companyState: { type: Boolean, default: null },
	createdAt: { type: Date, default: null },
	updatedAt: { type: Date, default: null },
	personalToken: String
});

userSchema.methods.encryptPass = async (password: string): Promise<string> => {
	const salt = await bcrypt.genSalt(9);
	return bcrypt.hash(password, salt);
};

userSchema.methods.decryptPass = async function(
	password: any
): Promise<boolean> {
	return await bcrypt.compare(password, this.password);
};

export const User = model('User', userSchema);
