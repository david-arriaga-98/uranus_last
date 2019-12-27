import axios from 'axios';

export default class FindUserBySchedule {
	private schedule: any;

	constructor(schedule: any) {
		this.schedule = schedule;
	}

	async findUser() {
		const response = await axios.get(
			`http://fenixerp.info/api/v1/730bf4bdb6ec369f235a8416e20c9c07/cedula_ec/?nui=${this.schedule}`
		);
		if (
			response.data.result === null ||
			response.data.result === undefined ||
			response.data.result === ''
		) {
			return {
				code: 404,
				status: 'error',
				message: `El usuario con la cédula ${this.schedule}, no existe en el sistema general`
			};
		} else {
			return {
				code: 200,
				status: 'success',
				user: response.data.result
			};
		}
	}
}
