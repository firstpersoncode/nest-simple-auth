import { ConnectionOptions } from 'typeorm'

const ormconfig: ConnectionOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    entities: [__dirname + '/**/*.entity.{js,ts}'],
    migrations: [__dirname + '/migrations/**/*.{js,ts}'],
    cli: {
        migrationsDir: 'src/migrations',
    },
    synchronize: true,

    // migrationsRun: true,
    // logging: false
}

export = ormconfig
