import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('token')
export class TokenEntity extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	id: number

	@Column()
	sign: string

	@CreateDateColumn({
		type: 'timestamptz'
	})
	created: string

	@UpdateDateColumn({
		type: 'timestamptz'
	})
	updated: string
}
