import { IsNotEmpty, IsLongitude, IsLatitude, IsOptional, IsBoolean } from 'class-validator'

export class ReportCreate {
    @IsNotEmpty()
    userId: string

    @IsOptional()
    @IsBoolean()
    self?: boolean

    @IsOptional()
    name?: string

    @IsOptional()
    @IsBoolean()
    fever?: boolean

    @IsOptional()
    @IsBoolean()
    cough?: boolean

    @IsOptional()
    @IsBoolean()
    sneeze?: boolean

    @IsOptional()
    @IsBoolean()
    sore?: boolean

    @IsOptional()
    @IsBoolean()
    asphyxiate?: boolean

    @IsOptional()
    @IsBoolean()
    contacted?: boolean

    @IsNotEmpty()
    address: string

    @IsNotEmpty()
    @IsLongitude()
    longitude: number

    @IsNotEmpty()
    @IsLatitude()
    latitude: number
}
