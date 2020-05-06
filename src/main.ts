import { ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { useContainer } from 'class-validator'
import * as cookieParser from 'cookie-parser'
import 'dotenv/config'

import { join } from 'path'
import 'reflect-metadata'
import { AppModule } from './app.module'
import { OwnerGuard } from './auth/guards/owner.guard'
import { RoleGuard } from './auth/guards/role.guard'

import { SessionGuard } from './auth/guards/session.guard'

async function bootstrap () {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			validationError: { target: false }
		})
	)

	app.use(cookieParser())

	app.useStaticAssets(join(__dirname, '..', 'public'))
	app.setBaseViewsDir(join(__dirname, '..', 'template'))
	app.setViewEngine('pug')

	const reflector = app.get(Reflector)
	void reflector

	app.useGlobalGuards(new SessionGuard(reflector))
	app.useGlobalGuards(new OwnerGuard(reflector))
	app.useGlobalGuards(new RoleGuard(reflector))

	useContainer(app.select(AppModule), { fallbackOnErrors: true })
	app.enableCors({
		origin: function (origin, callback) {
			// allow requests with no origin
			// (like mobile apps or curl requests)
			// if (!origin) return callback(null, true)

			return callback(null, true)
		}
	})
	await app.listen(process.env.PORT || 5000)
}

bootstrap()
