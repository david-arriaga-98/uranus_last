import randomStrings from 'crypto-random-string';

export default class Tokens {
	private _length = 0;

	constructor(length: number) {
		this._length = length;
	}

	getUrlToken(): string {
		const urlToken: string = randomStrings({
			type: 'hex',
			length: this._length
		});
		return urlToken;
	}
}
