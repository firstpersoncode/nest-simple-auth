import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Request } from "express"
import * as jwt from 'jsonwebtoken'
import { getRepository } from 'typeorm'

import { UserEntity } from '../../user/user.entity'
import { signName } from "../../utils/constants"
import { JWTPayload } from '../../utils/types/jwt.interface'

import { TokenEntity } from '../token.entity'

export class BaseGuard {
	public async getRequest (context: ExecutionContext): Promise<any> {
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

		return { request, token, payload, user }
	}

	public async signToken (payload: UserEntity): Promise<string> {
		// sign token
		const sign = jwt.sign(
			{
				sub: payload.publicId,
				role: payload.role
			},
			process.env.APP_SECRET
			// { expiresIn: '1h' }
		)
		const token = new TokenEntity()
		token.sign = sign
		await token.save()

		return token.sign
	}

	public async getToken (sign: string): Promise<TokenEntity> {
		const tokenRepository = getRepository(TokenEntity)
		const token = await tokenRepository.findOne({ where: { sign } })

		if (!token) {
			throw new UnauthorizedException('invalid')
		}

		return token
	}

	public async getSession (payload: JWTPayload): Promise<UserEntity> {
		const userRepository = getRepository(UserEntity)

		return await userRepository.findOne({ where: { publicId: payload.sub } })
	}

	public async verifyToken (token: TokenEntity): Promise<JWTPayload> {
		// decode token
		let payload: JWTPayload

		try {
			payload = jwt.verify(token.sign, process.env.APP_SECRET) as JWTPayload
		} catch (err) {
			if (err.name === 'TokenExpiredError') {
				await token.remove()
			}

			throw err
		}

		return payload
	}
}
