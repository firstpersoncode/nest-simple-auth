import { IsInt, Min, Max, IsOptional, IsLongitude, IsLatitude, IsDateString } from 'class-validator'

export class UserUpdate {
    @IsOptional()
    @IsInt()
    status?: number

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(2)
    role?: number

    @IsOptional()
    name?: string

    @IsOptional()
    email?: string

    @IsOptional()
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
