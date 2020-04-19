import { Stats } from 'fs'

export interface ExportFile {
    stats: Stats
    name: string
    type: string
    path: string
}
