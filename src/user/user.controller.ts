import { Get, Controller, Param, Body, Post, Delete, Put, Query, Res } from '@nestjs/common'
import { Response } from 'express'

import { USER_ROLE } from '../utils/constants'
import { UserRole } from '../utils/decorators/user-role.decorator'
import { Owner } from '../utils/decorators/owner.decorator'
import { Public } from '../utils/decorators/public.decorator'

import { UserService } from './user.service'
import { UserCreate } from './dtos/user.create.dto'
import { UserUpdate } from './dtos/user.update.dto'
import { UserQuery } from './dtos/user.query.dto'

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService) {}

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
        } as UserQuery

        const users = await this.service.queryAll(options)

        return users.map((user) => {
            delete user.password

            return user
        })
    }

    // @Get('dummy')
    // @Public()
    // async dummy() {
    //     const users = await this.service.dummy()
    //
    //     return users.map((user) => {
    //         delete user.password
    //
    //         return user
    //     })
    // }

    @Get(':id')
    @UserRole(USER_ROLE.read)
    async listById(@Param('id') id: string) {
        const user = await this.service.queryById(id)
        delete user.password

        return user
    }

    @Get(':id/verify')
    @UserRole(USER_ROLE.read)
    public async verify(@Param('id') id: string, @Res() res: Response) {
        const user = await this.service.verify(id)

        if (user.status) {
            return res.render('notif-user-verified', { email: user.email })
        }

        return res.render('notif-error')
    }

    @Get(':id/verification')
    @UserRole(USER_ROLE.read)
    public async verification(@Param('id') id: string) {
        return await this.service.notifVerification(id)
    }

    @Post()
    @Public()
    async create(@Body() body: UserCreate) {
        const user = await this.service.create(body)
        // this.service.notifNewUser(user)
        this.service.notifVerification(user.publicId)
        delete user.password

        return user
    }

    @Put(':id')
    @Owner()
    @UserRole(USER_ROLE.write)
    async update(@Param('id') id: string, @Body() body: UserUpdate) {
        const user = await this.service.update(id, body)
        delete user.password

        return user
    }

    @Delete()
    @UserRole(USER_ROLE.super)
    async deleteArchives() {
        return await this.service.removeArchives()
    }

    @Delete(':id')
    @Owner()
    @UserRole(USER_ROLE.write)
    async delete(@Param('id') id: string) {
        const user = await this.service.archive(id)
        delete user.password

        return user
    }

    @Delete(':id/:notifier')
    @Owner()
    @UserRole(USER_ROLE.write)
    async clearNotification(@Param('id') id: string, @Param('notifier') notifier: string) {
        const user = await this.service.clearNotification(id, notifier)
        delete user.password

        return user
    }
}
