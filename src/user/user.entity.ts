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
    dob: Date

    @Column()
    address: string

    @Column()
    longitude: number

    @Column()
    latitude: number

    @Column()
    password: string

    @Column({ default: false })
    redzone: boolean

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

    async checkPassword(plainPassword: string) {
        return await bcrypt.compare(plainPassword, this.password)
    }
}
