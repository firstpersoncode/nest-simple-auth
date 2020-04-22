import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MailerService } from '@nestjs-modules/mailer'
import { Repository } from 'typeorm'

import { uuid } from '../utils/uuid'
import { UserService } from '../user/user.service'

import { ReportEntity } from './report.entity'
import { ReportCreate } from './dtos/report.create.dto'
import { ReportUpdate } from './dtos/report.update.dto'
import { ReportQuery } from './dtos/report.query.dto'

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(ReportEntity)
        private readonly repository: Repository<ReportEntity>,

        private readonly userService: UserService,
        private readonly mailerService: MailerService
    ) {}

    async queryAll(options: ReportQuery): Promise<ReportEntity[]> {
        const { skip, take, order, orderBy, start, end, q, v } = options
        const query = this.repository.createQueryBuilder('report')

        if (start && !end) {
            query.where('report.created >= :start ', { start })
        } else if (!start && end) {
            query.where('report.created < :end ', { end })
        } else if (start && end) {
            query.where('report.created BETWEEN :start AND :end', { start, end })
        }

        if (q && v) {
            query.andWhere(`${q} = :v`, { v })
        }

        query.orderBy(`report.${orderBy}`, order)

        if (skip) {
            query.skip(skip)
        }

        if (take) {
            query.take(take)
        }

        return await query.getMany()
    }

    async queryById(id: string): Promise<ReportEntity> {
        const report = await this.repository.findOne({ where: { publicId: id }, relations: ['user'] })

        if (!report) {
            throw new NotFoundException(`There isn't any report with identifier: ${id}`)
        }

        delete report.user.password

        return report
    }

    async create(body: ReportCreate): Promise<ReportEntity> {
        const user = await this.userService.queryById(body.userId)
        const report = new ReportEntity()
        report.publicId = uuid()
        report.user = user
        const fields = ['self', 'fever', 'cough', 'sneeze', 'sore', 'asphyxiate', 'contacted', 'latitude', 'longitude']

        for (const field in body) {
            if (fields.includes(field)) {
                report[field] = body[field]
            }
        }

        await report.save()

        return report
    }

    async update(id: string, body: ReportUpdate): Promise<ReportEntity> {
        const report = await this.queryById(id)
        const fields = ['self', 'fever', 'cough', 'sneeze', 'sore', 'asphyxiate', 'contacted', 'latitude', 'longitude']

        for (const field in body) {
            if (fields.includes(field)) {
                report[field] = body[field]
            }
        }

        await report.save()

        return report
    }

    async archive(id: string): Promise<ReportEntity> {
        const report = await this.queryById(id)
        report.archived = 1
        await report.save()

        return report
    }

    async removeArchives(): Promise<ReportEntity[]> {
        const reports = await this.repository.find({ where: { archived: 1 } })
        let deleted = []

        for (const report of reports) {
            const removed = Object.assign({}, report)
            await report.remove()
            deleted = [...deleted, removed]
        }

        return deleted
    }

    async verify(id: string): Promise<ReportEntity> {
        const report = await this.queryById(id)
        report.status = 1
        await report.save()

        return report
    }

    async notifNewReport(report: ReportEntity): Promise<boolean> {
        // email notification to PIC
        await this.mailerService.sendMail({
            to: 'nasser.maronie@gmail.com',
            from: 'nasser.maronie@gmail.com',
            subject: 'NEW REPORT',
            template: 'notif-report-new',
            context: report
        })

        return true
    }
}
