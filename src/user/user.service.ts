import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MailerService } from '@nestjs-modules/mailer'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import * as shortid from 'shortid'

import { uuid } from '../utils/uuid'

import { UserEntity } from './user.entity'
import { UserCreate } from './dtos/user.create.dto'
import { UserUpdate } from './dtos/user.update.dto'
import { UserQuery } from './dtos/user.query.dto'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,

        // private readonly reportService: ReportService,
        private readonly mailerService: MailerService
    ) {}

    async queryAll(options: UserQuery): Promise<UserEntity[]> {
        const { skip, take, order, orderBy, start, end, q, v } = options
        const query = this.repository.createQueryBuilder('user')

        if (start && !end) {
            query.where('user.created >= :start ', { start })
        } else if (!start && end) {
            query.where('user.created < :end ', { end })
        } else if (start && end) {
            query.where('user.created BETWEEN :start AND :end', { start, end })
        }

        if (q && v) {
            query.andWhere(`${q} = :v`, { v })
        }

        query.orderBy(`user.${orderBy}`, order)

        if (skip) {
            query.skip(skip)
        }

        if (take) {
            query.take(take)
        }

        return await query.getMany()
    }

    async queryById(id: string): Promise<UserEntity> {
        const user = await this.repository.findOne({ where: { publicId: id }, relations: ['reports'] })

        if (!user) {
            throw new NotFoundException(`There isn't any user with identifier: ${id}`)
        }

        return user
    }

    async queryByEmail(email: string): Promise<UserEntity> {
        const user = await this.repository.findOne({ where: { email } })

        if (!user) {
            throw new NotFoundException(`There isn't any user with identifier: ${email}`)
        }

        return user
    }

    async create(body: UserCreate): Promise<UserEntity> {
        let user = await this.repository.findOne({ where: { email: body.email } })

        if (user) {
            throw new BadRequestException('user with email: ' + body.email + ' already exists')
        }

        user = new UserEntity()
        const salt = await bcrypt.genSalt()
        user.password = await bcrypt.hash(body.password, salt)
        user.publicId = uuid()
        const fields = ['name', 'email', 'phone', 'dob', 'address', 'latitude', 'longitude']

        for (const field in body) {
            if (fields.includes(field)) {
                user[field] = body[field]
            }
        }

        await user.save()

        return user
    }

    async update(id: string, body: UserUpdate): Promise<UserEntity> {
        const user = await this.queryById(id)
        const fields = ['name', 'phone', 'dob', 'address', 'latitude', 'longitude']

        for (const field in body) {
            if (fields.includes(field)) {
                user[field] = body[field]
            }
        }

        if (typeof body.password !== 'undefined') {
            const salt = await bcrypt.genSalt()
            user.password = await bcrypt.hash(body.password, salt)
        }

        await user.save()

        return user
    }

    async archive(id: string): Promise<UserEntity> {
        const user = await this.queryById(id)
        user.archived = 1
        await user.save()

        return user
    }

    async removeArchives(): Promise<UserEntity[]> {
        const users = await this.repository.find({ where: { archived: 1 } })
        let deleted = []

        for (const user of users) {
            const removed = Object.assign({}, user)
            await user.remove()
            deleted = [...deleted, removed]
        }

        return deleted
    }

    async generateCode(id: string): Promise<UserEntity> {
        const user = await this.queryById(id)
        user.code = shortid()
        await user.save()

        return user
    }

    async verify(id: string, code: string): Promise<UserEntity> {
        const user = await this.queryById(id)

        if (user.code === code) {
            user.status = 1
            user.code = ''
            await user.save()
        }

        return user
    }

    async resetPassword(email: string): Promise<string> {
        const user = await this.queryByEmail(email)
        const salt = await bcrypt.genSalt()
        const newPassword = shortid()
        user.password = await bcrypt.hash(newPassword, salt)
        await user.save()

        return newPassword
    }

    async notification(id: string, notifier: string): Promise<UserEntity> {
        const user = await this.queryById(id)
        user[notifier] = user[notifier] + 1
        user.save()

        return user
    }

    async clearNotification(id: string, notifier: string): Promise<UserEntity> {
        const user = await this.queryById(id)
        user[notifier] = 0
        user.save()

        return user
    }

    async notifVerification(id: string): Promise<boolean> {
        const user = await this.queryById(id)

        // email notification to PIC
        await this.mailerService.sendMail({
            to: user.email,
            from: 'nasser.maronie@gmail.com',
            subject: 'Email Verification',
            template: 'notif-user-verification',
            context: {
                name: user.name,
                code: user.code
            }
        })

        return true
    }

    async notifResetPassword(email: string, password: string): Promise<boolean> {
        const user = await this.queryByEmail(email)

        // email notification to PIC
        await this.mailerService.sendMail({
            to: user.email,
            from: 'nasser.maronie@gmail.com',
            subject: 'Reset Password',
            template: 'notif-user-reset-password',
            context: {
                name: user.name,
                password
            }
        })

        return true
    }

    async notifNewUser(user: UserEntity): Promise<boolean> {
        // email notification to PIC
        await this.mailerService.sendMail({
            to: 'nasser.maronie@gmail.com',
            from: 'nasser.maronie@gmail.com',
            subject: 'NEW USER',
            template: 'notif-user-new',
            context: user
        })

        return true
    }
}
