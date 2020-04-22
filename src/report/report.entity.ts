import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne
} from 'typeorm'

import { UserEntity } from '../user/user.entity'

@Entity('report')
export class ReportEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ unique: true })
    publicId: string

    @Column({
        default: 1
    })
    status: number

    @Column({
        default: false
    })
    self: boolean

    @Column({
        default: 'anonymous'
    })
    name: string

    @Column({
        default: false
    })
    fever: boolean

    @Column({
        default: false
    })
    cough: boolean

    @Column({
        default: false
    })
    sneeze: boolean

    @Column({
        default: false
    })
    sore: boolean

    @Column({
        default: false
    })
    asphyxiate: boolean

    @Column({
        default: false
    })
    contacted: boolean

    @Column({ type: 'float' })
    longitude: number

    @Column({ type: 'float' })
    latitude: number

    @ManyToOne(
        () => UserEntity,
        (user) => user.reports
    )
    user: UserEntity

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
}
