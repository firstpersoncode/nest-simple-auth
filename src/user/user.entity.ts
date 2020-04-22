import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm'
import * as bcrypt from 'bcryptjs'
import * as shortid from 'shortid'

import { ReportEntity } from '../report/report.entity'

@Entity('user')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ unique: true })
    publicId: string

    @Column({
        default: 0
    })
    status: number

    @Column({
        default: 1
    })
    role: number

    @Column()
    name: string

    @Column({ unique: true })
    email: string

    @Column()
    phone: string

    @Column({
        type: 'date',
        nullable: true
    })
    dob: string

    @Column()
    address: string

    @Column({ type: 'float' })
    longitude: number

    @Column({ type: 'float' })
    latitude: number

    @Column()
    password: string

    @Column({ default: 0 })
    ntr: number

    @Column({ default: 0 })
    nte: number

    @Column({ default: 0 })
    ntm: number

    @OneToMany(
        () => ReportEntity,
        (report) => report.user
    )
    reports: ReportEntity[]

    @CreateDateColumn({
        type: 'timestamptz'
    })
    created: string

    @UpdateDateColumn({
        type: 'timestamptz'
    })
    updated: string

    @Column({
        default: 0
    })
    archived: number

    @Column({
        default: shortid()
    })
    code: string

    async checkPassword(plainPassword: string) {
        return await bcrypt.compare(plainPassword, this.password)
    }
}
