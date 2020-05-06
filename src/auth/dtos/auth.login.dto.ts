import { IsNotEmpty } from 'class-validator'

export class AuthLogin {
	@IsNotEmpty()
	email: string

	@IsNotEmpty()
	password: string
}
