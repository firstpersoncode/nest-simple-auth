import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { BaseGuard } from './base.guard'

@Injectable()
export class SessionGuard extends BaseGuard implements CanActivate {
	constructor (private readonly reflector: Reflector) {
		super()
	}

	async canActivate (context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.get<boolean>('public', context.getHandler())

		if (isPublic) {
			return true
		}

		const { user } = await this.getRequest(context)

		return Boolean(user)
	}
}
