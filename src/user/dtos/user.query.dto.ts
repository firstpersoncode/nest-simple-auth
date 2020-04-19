import { IsOptional, IsNotEmpty } from 'class-validator'

export class UserQuery {
    @IsOptional()
    take?: number

    @IsOptional()
    skip?: number

    @IsNotEmpty()
    order: 'ASC' | 'DESC'

    @IsNotEmpty()
    orderBy: string

    @IsOptional()
    start?: string

    @IsOptional()
    end?: string

    @IsOptional()
    q?: string

    @IsOptional()
    v?: string | number
}
