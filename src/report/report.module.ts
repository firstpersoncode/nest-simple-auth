import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '../user/user.module'

import { ReportService } from './report.service'
import { ReportEntity } from './report.entity'
import { ReportController } from './report.controller'

@Module({
    imports: [UserModule, TypeOrmModule.forFeature([ReportEntity])],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportModule {}
