import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailerModule } from '@nestjs-modules/mailer'

import * as ormconfig from './orm.config'
import * as mailerconfig from './mailer.config'

import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ReportModule } from './report/report.module'

@Module({
    imports: [
        TypeOrmModule.forRoot(ormconfig),
        MailerModule.forRoot(mailerconfig),
        AuthModule,
        UserModule,
        ReportModule,
    ],
})
export class AppModule {}
