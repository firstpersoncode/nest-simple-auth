import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { BaseGuard } from './base.guard'

@Injectable()
export class RoleGuard extends BaseGuard implements CanActivate {
	constructor (private readonly reflector: Reflector) {
		super()
	}

	async canActivate (context: ExecutionContext): Promise<boolean> {
		const role = this.reflector.get<number>('role', context.getHandler())

		if (typeof role !== 'number' && !role) {
			return true
		}

		const { user } = await this.getRequest(context)

		return Boolean(user && user.role >= role)
	}
}
