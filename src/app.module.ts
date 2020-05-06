import { MailerModule } from "@nestjs-modules/mailer"
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { AuthModule } from "./auth/auth.module"
import * as mailerconfig from "./mailer.config"

import * as ormconfig from "./orm.config"
import { UserModule } from "./user/user.module"

@Module({
	imports: [
		TypeOrmModule.forRoot(ormconfig),
		MailerModule.forRoot(mailerconfig),
		AuthModule,
		UserModule
	]
})
export class AppModule {
}
