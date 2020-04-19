import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MailerService } from '@nestjs-modules/mailer'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'

import { uuid } from '../utils/uuid'
import { calculateDistance } from '../utils/calculateDistance'
import { USER_ROLE, ALERT_DISTANCE } from '../utils/constants'
// import { makeEmail, getRandomInRange, generateName } from '../utils/rand'
// import { ReportService } from '../report/report.service'

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
        private readonly mailerService: MailerService,
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

        if (user.role >= USER_ROLE.super) {
            fields.push('role')
        }

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

    async verify(id: string): Promise<UserEntity> {
        const user = await this.queryById(id)
        user.status = 1
        await user.save()

        return user
    }

    async notifVerification(id: string): Promise<UserEntity> {
        const user = await this.queryById(id)

        if (user.status) {
            return user
        }

        // email notification to PIC
        await this.mailerService.sendMail({
            to: user.email,
            from: 'nasser.maronie@irvinsaltedegg.com',
            subject: 'Email Verification',
            template: 'notif-user-verification',
            context: {
                name: user.name,
                action: `https://localhost:5000/user/${id}/verify`,
            },
        })

        return user
    }

    // async locateNotification(id: string, location: { latitude: number; longitude: number }): Promise<boolean> {
    //     const user = await this.queryById(id)
    //     const distanceM = calculateDistance(location.latitude, location.longitude, user.latitude, user.longitude, 'Mt')
    //
    //     if (distanceM <= ALERT_DISTANCE.m) {
    //         user.ntr = user.ntr + 1
    //         await user.save()
    //     }
    //
    //     const distanceKM = calculateDistance(location.latitude, location.longitude, user.latitude, user.longitude, 'K')
    //     // within radius of 3km, there should be 30 report
    //     // each have minimum one symptom that is true
    //     // and each report maximum distance = 100m
    //
    //     const redZone = false
    //     if (distanceKM <= ALERT_DISTANCE.km) {
    //         // user.ntr = user.ntr + 1
    //         user.redzone = true
    //         await user.save()
    //     }
    //
    //     return true
    // }

    async notification(notifier: string, location: { latitude: number; longitude: number }, warning): Promise<boolean> {
        const users = await this.queryAll({
            orderBy: 'created',
            order: 'DESC',
        })

        for (const user of users) {
            const distance = calculateDistance(
                location.latitude,
                location.longitude,
                user.latitude,
                user.longitude,
                'Mt',
            )

            if (distance <= ALERT_DISTANCE.m && warning) {
                user[notifier] = user[notifier] + 1
                await user.save()
            }
        }

        return true
    }

    async clearNotification(id: string, notifier: string): Promise<UserEntity> {
        const user = await this.queryById(id)
        user[notifier] = 0
        user.save()

        return user
    }

    async notifNewUser(user: UserEntity): Promise<boolean> {
        // email notification to PIC
        await this.mailerService.sendMail({
            to: 'nasser.maronie@gmail.com',
            from: 'nasser.maronie@gmail.com',
            subject: 'NEW USER',
            template: 'notif-user-new',
            context: user,
        })

        return true
    }

    // async dummy() {
    //     const dummyUsers = [...Array(50)].map((_) => ({
    //         role: 2,
    //         name: generateName(),
    //         email: makeEmail(),
    //         phone: Math.floor(100000000 + Math.random() * 900000000).toString(),
    //         dob: new Date(1992, 1, 1),
    //         address: 'qwertyuiop',
    //         latitude: getRandomInRange(-100000, 100000, 3),
    //         longitude: getRandomInRange(-100000, 100000, 3),
    //         password: 'root',
    //     }))
    //     let newUsers = []
    //
    //     for (const dummyUser of dummyUsers) {
    //         const user = await this.create(dummyUser)
    //         await this.verify(user.publicId)
    //         await this.reportService.create({
    //             userId: user.publicId,
    //             self: true,
    //             fever: true,
    //             sneeze: true,
    //             contacted: true,
    //             address: 'qwertyuiop',
    //             latitude: getRandomInRange(-100000, 100000, 3),
    //             longitude: getRandomInRange(-100000, 100000, 3),
    //         })
    //         newUsers = [...newUsers, user]
    //     }
    //
    //     return newUsers
    // }
}
