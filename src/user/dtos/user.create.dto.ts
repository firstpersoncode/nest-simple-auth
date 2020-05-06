import { IsDateString, IsLatitude, IsLongitude, IsNotEmpty, IsNumberString } from 'class-validator'

export class UserCreate {
	@IsNotEmpty()
	name: string

	@IsNotEmpty()
	email: string

	@IsNotEmpty()
	@IsNumberString()
	phone: string

	@IsNotEmpty()
	@IsDateString()
	dob: string

	@IsNotEmpty()
	address: string

	@IsNotEmpty()
	@IsLongitude()
	longitude: number

	@IsNotEmpty()
	@IsLatitude()
	latitude: number

	@IsNotEmpty()
	password: string
}
