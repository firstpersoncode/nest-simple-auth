import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { Reflector } from '@nestjs/core'

import { signName } from '../constants'

import { BaseGuard } from './base.guard'

@Injectable()
export class SessionGuard extends BaseGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
        super()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.get<boolean>('public', context.getHandler())

        if (isPublic) {
            return true
        }

        const request = context.switchToHttp().getRequest() as Request

        if (!request.cookies) {
            throw new UnauthorizedException()
        }

        const sign = request.cookies[signName]

        if (!sign) {
            throw new UnauthorizedException()
        }

        const token = await this.getToken(sign)
        const payload = await this.verifyToken(token)
        const user = await this.getSession(payload)

        return Boolean(user)
    }
}
