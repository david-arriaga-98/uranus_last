import sgMail from '@sendgrid/mail';

export default class SendMail {
	private _sendgridKey: any = process.env.SENDGRID_API_KEY;

	async sendVerifyEmail(user: any, password: any) {
		try {
			sgMail.setApiKey(this._sendgridKey);

			const html = `
                <p>Bienvenido <strong>${user.names}</strong> :)</p> </br>
                <p>Preciona el link, para verificar tu cuenta:</p> </br>
                <a href="https://api.uranus-application.me/user/verify/${user.personalToken}" target="_blank">Da click Aquí</a> </br>
                <p>Y su contraseña provisional es: ${password}</p></br>
                <p>Si el botón no funciona, copia y pega lo siguiente:</p></br>
                <p>https://api.uranus-application.me/user/verify/${user.personalToken}</p>
            `;
			const msg = {
				to: user.email,
				from: 'uranus-system@no-reply.dev',
				subject: 'Verificación tu cuenta',
				html
			};
			await sgMail.send(msg);
		} catch (error) {
			console.log("No se ha enviado un Email :'(");
		}
	}
}
