import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { Reflector } from '@nestjs/core'

import { signName, USER_ROLE } from '../constants'

import { BaseGuard } from './base.guard'

@Injectable()
export class OwnerGuard extends BaseGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
        super()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isOwner = this.reflector.get<boolean>('owner', context.getHandler())

        if (!isOwner) {
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

        if (user.role >= USER_ROLE.super) {
            return true
        }

        return request.body && request.body.userId
            ? user.publicId === request.body.userId
            : user.publicId === request.params.id
    }
}
