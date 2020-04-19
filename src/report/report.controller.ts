import { Get, Controller, Param, Body, Post, Delete, Put, Query } from '@nestjs/common'

import { USER_ROLE } from '../utils/constants'
import { UserRole } from '../utils/decorators/user-role.decorator'

import { ReportService } from './report.service'
import { ReportCreate } from './dtos/report.create.dto'
import { ReportUpdate } from './dtos/report.update.dto'
import { ReportQuery } from './dtos/report.query.dto'
import { Public } from 'src/utils/decorators/public.decorator'
import { Owner } from 'src/utils/decorators/owner.decorator'

@Controller('report')
export class ReportController {
    constructor(private readonly service: ReportService) {}

    @Get()
    @Public()
    async list(
        @Query('take') take?: string,
        @Query('skip') skip?: string,
        @Query('orderBy') orderBy?: string,
        @Query('order') order?: string,
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('q') q?: string,
        @Query('v') v?: string,
    ) {
        const options = {
            orderBy: orderBy || 'created',
            order: order || 'DESC',
            ...(take ? { take: Number(take) } : {}),
            ...(skip ? { skip: Number(skip) } : {}),
            ...(start ? { start } : {}),
            ...(end ? { end } : {}),
            ...(q ? { q } : {}),
            ...(v ? { v } : {}),
        } as ReportQuery

        return await this.service.queryAll(options)
    }

    @Get(':id')
    @Public()
    async listById(@Param('id') id: string) {
        return await this.service.queryById(id)
    }

    @Get(':id/verify')
    @UserRole(USER_ROLE.super)
    public async verify(@Param('id') id: string) {
        return await this.service.verify(id)
    }

    @Post()
    @Owner()
    @UserRole(USER_ROLE.write)
    async create(@Body() body: ReportCreate) {
        const report = await this.service.create(body)
        // this.service.notifNewReport(report)

        return report
    }

    @Put(':id')
    @Owner()
    @UserRole(USER_ROLE.super)
    async update(@Param('id') id: string, @Body() body: ReportUpdate) {
        return await this.service.update(id, body)
    }

    @Delete()
    @UserRole(USER_ROLE.super)
    async deleteArchives() {
        return await this.service.removeArchives()
    }

    @Delete(':id')
    @UserRole(USER_ROLE.super)
    async delete(@Param('id') id: string) {
        return await this.service.archive(id)
    }
}
