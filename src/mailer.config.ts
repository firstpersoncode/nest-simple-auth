import { MailerOptions, PugAdapter } from '@nestjs-modules/mailer'
import { join } from 'path'
// import { createTransport } from 'nodemailer'

const mailerconfig: MailerOptions = {
	// transport: createTransport({
	//     // driver: process.env.MAILER_DRIVER,
	//     host: process.env.MAILER_HOST,
	//     port: Number(process.env.MAILER_PORT),
	//     auth: {
	//         user: process.env.MAILER_USER,
	//         pass: process.env.MAILER_PASSWORD
	//     }
	// }),
	transport: `${ process.env.MAILER_DRIVER }://${ process.env.MAILER_USER }:${ process.env.MAILER_PASSWORD }@${ process.env.MAILER_HOST }:${ process.env.MAILER_PORT }`,
	template: {
		dir: join(__dirname, '..', 'template'),
		adapter: new PugAdapter(),
		options: {
			strict: true
		}
	}
}

export = mailerconfig
