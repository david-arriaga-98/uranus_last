import jwt from 'jwt-simple';
import moment from 'moment';

export default class Authorization {
	private _user: any;
	private _key: any;

	constructor(user: any) {
		this._user = user;
		this._key = process.env.TOKEN_KEY;
	}

	generateUserToken(): string {
		const payload = {
			sub: this._user._id,
			names: this._user.names,
			role: this._user.role,
			iat: moment().unix(),
			exp: moment()
				.add(8, 'hours')
				.unix()
		};

		return jwt.encode(payload, this._key);
	}

	generateClientToken(): string {
		const payload = {
			sub: this._user._id,
			names: this._user.names,
			role: this._user.role,
			iat: moment().unix(),
			exp: moment()
				.add(1, 'years')
				.unix()
		};

		return jwt.encode(payload, this._key);
	}
}
