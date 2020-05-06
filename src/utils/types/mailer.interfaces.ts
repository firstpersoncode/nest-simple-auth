interface MailerOptionCtx {
	username: string
	header: string
	body: string
}

export interface MailerOption {
	to: string
	from: string
	subject: string
	template: string
	context: MailerOptionCtx
}
