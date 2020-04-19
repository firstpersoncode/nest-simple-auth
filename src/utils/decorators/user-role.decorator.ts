import { SetMetadata } from '@nestjs/common'

export const UserRole = (role: number) => SetMetadata('role', role)
