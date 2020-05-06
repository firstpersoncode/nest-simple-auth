import * as shortid from 'shortid'

export const uuid = (prefix: string = 'U'): string => {
	shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$.')
	const timestamp = Math.floor(Date.now() / 1000)
	return (
		prefix +
		':' +
		shortid
			.generate()
			.toUpperCase()
			.slice(0, -3) +
		':' +
		timestamp
	)
}
