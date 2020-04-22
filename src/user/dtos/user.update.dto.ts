import { IsOptional, IsDateString, IsNumber, IsLongitude, IsLatitude } from 'class-validator'

export class UserUpdate {
    @IsOptional()
    name?: string

    @IsOptional()
    email?: string

    @IsOptional()
    @IsNumber()
    phone?: string

    @IsOptional()
    @IsDateString()
    dob?: string

    @IsOptional()
    address?: string

    @IsOptional()
    @IsLongitude()
    longitude?: number

    @IsOptional()
    @IsLatitude()
    latitude?: number

    @IsOptional()
    password?: string
}
