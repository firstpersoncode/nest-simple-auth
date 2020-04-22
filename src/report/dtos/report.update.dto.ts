import { IsOptional, IsBoolean, IsLongitude, IsLatitude } from 'class-validator'

export class ReportUpdate {
    @IsOptional()
    @IsBoolean()
    self?: boolean

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
    @IsLongitude()
    longitude?: number

    @IsOptional()
    @IsLatitude()
    latitude?: number
}
