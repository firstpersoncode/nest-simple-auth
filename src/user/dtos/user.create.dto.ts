import { IsNotEmpty, IsInt, Min, Max, IsLongitude, IsLatitude, IsOptional, IsDateString } from 'class-validator'

export class UserCreate {
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(2)
    role?: number

    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    email: string

    @IsNotEmpty()
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
