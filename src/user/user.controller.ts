import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'

import { USER_ROLE } from '../utils/constants'
import { UserRole } from '../auth/decorators/user-role.decorator'
import { Owner } from '../auth/decorators/owner.decorator'
import { Public } from '../auth/decorators/public.decorator'

import { UserService } from './user.service'
import { UserCreate } from './dtos/user.create.dto'
import { UserUpdate } from './dtos/user.update.dto'
import { UserQuery } from './dtos/user.query.dto'

@Controller('user')
export class UserController {
	constructor (private readonly service: UserService) {
	}

	@Get()
	@Public()
	async list (
		@Query('take') take?: string,
		@Query('skip') skip?: string,
		@Query('orderBy') orderBy?: string,
		@Query('order') order?: string,
		@Query('start') start?: string,
		@Query('end') end?: string,
		@Query('q') q?: string,
		@Query('v') v?: string
	) {
		const options = {
			orderBy: orderBy || 'created',
			order: order || 'DESC',
			...(take ? { take: Number(take) } : {}),
			...(skip ? { skip: Number(skip) } : {}),
			...(start ? { start } : {}),
			...(end ? { end } : {}),
			...(q ? { q } : {}),
			...(v ? { v } : {})
		} as UserQuery

		const users = await this.service.queryAll(options)

		return users.map((user) => {
			delete user.password

			return user
		})
	}

	@Get('reset-password')
	@Public()
	public async resetPassword (@Query('email') email: string) {
		const newPassword = await this.service.resetPassword(email)
		await this.service.notifResetPassword(email, newPassword)

		return { email, newPassword: true }
	}

	@Get(':id')
	@UserRole(USER_ROLE.read)
	async listById (@Param('id') id: string) {
		const user = await this.service.queryById(id)
		delete user.password

		return user
	}

	@Get(':id/generate-code')
	@UserRole(USER_ROLE.read)
	public async generateCode (@Param('id') id: string) {
		const user = await this.service.generateCode(id)
		await this.service.notifVerification(id)
		delete user.password

		return user
	}

	@Get(':id/verify')
	@UserRole(USER_ROLE.read)
	public async verify (@Param('id') id: string, @Query('code') code: string) {
		const user = await this.service.verify(id, code)
		delete user.password

		return user
	}

	@Post()
	@Public()
	async create (@Body() body: UserCreate) {
		const user = await this.service.create(body)
		await this.service.notifVerification(user.publicId)
		delete user.password

		return user
	}

	@Put(':id')
	@Owner()
	@UserRole(USER_ROLE.write)
	async update (@Param('id') id: string, @Body() body: UserUpdate) {
		const user = await this.service.update(id, body)
		delete user.password

		return user
	}

	@Delete()
	@UserRole(USER_ROLE.super)
	async deleteArchives () {
		const users = await this.service.removeArchives()

		return users.map((user) => {
			delete user.password

			return user
		})
	}

	@Delete(':id')
	@Owner()
	@UserRole(USER_ROLE.write)
	async delete (@Param('id') id: string) {
		const user = await this.service.archive(id)
		delete user.password

		return user
	}
}
