import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { USER_ROLE } from '../../utils/constants'

import { BaseGuard } from './base.guard'

@Injectable()
export class OwnerGuard extends BaseGuard implements CanActivate {
	constructor (private readonly reflector: Reflector) {
		super()
	}

	async canActivate (context: ExecutionContext): Promise<boolean> {
		const isOwner = this.reflector.get<boolean>('owner', context.getHandler())

		if (!isOwner) {
			return true
		}

		const { request, user } = await this.getRequest(context)

		if (user.role >= USER_ROLE.super) {
			return true
		}

		return request.body && request.body.userId
			? user.publicId === request.body.userId
			: user.publicId === request.params.id
	}
}
