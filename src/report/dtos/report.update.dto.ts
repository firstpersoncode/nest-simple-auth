import { IsLongitude, IsLatitude, IsOptional, IsBoolean, IsInt } from 'class-validator'

export class ReportUpdate {
    @IsOptional()
    @IsInt()
    status?: number

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

    @IsOptional()
    address?: string

    @IsOptional()
    @IsLongitude()
    longitude?: number

    @IsOptional()
    @IsLatitude()
    latitude?: number
}
