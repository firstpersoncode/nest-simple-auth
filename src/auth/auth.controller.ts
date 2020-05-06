import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

import { signName, USER_ROLE } from '../utils/constants'

import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { UserRole } from './decorators/user-role.decorator'
import { AuthLogin } from './dtos/auth.login.dto'

@Controller('auth')
export class AuthController {
	constructor (private readonly service: AuthService) {
	}

	@Get('logout')
	@Public()
	public async logout (@Req() req: Request, @Res() res: Response) {
		const sign = req.cookies[signName]
		await this.service.logout(sign)
		res.clearCookie(signName)

		return res.send({ message: 'logged out' })
	}

	@Get('me')
	@UserRole(USER_ROLE.read)
	async me (@Req() req: Request) {
		const sign = req.cookies[signName]
		const session = await this.service.session(sign)
		delete session.password

		return session
	}

	@Post('login')
	@Public()
	public async login (@Body() body: AuthLogin, @Res() res: Response) {
		const sign = await this.service.login(body)
		res.cookie(signName, sign, {
			// maxAge: 60 * 60 * 1000 + 60, // '1h'
			httpOnly: true,
			secure: Boolean(process.env.NODE_ENV === 'production')
		})

		return res.send({ message: 'logged in', sign })
	}
}
