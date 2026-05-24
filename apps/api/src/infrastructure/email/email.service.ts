import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

/**
 * EmailService — Thin wrapper around nodemailer for SMTP delivery.
 *
 * Reads SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS from ConfigService.
 * Transporter is lazily constructed and cached.
 */
@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);
	private transporter?: Transporter;

	constructor(private readonly configService: ConfigService) {}

	async sendMail(options: SendMailOptions): Promise<void> {
		const transporter = this.getTransporter();
		if (!transporter) {
			this.logger.warn(
				`SMTP not configured - skipping email to ${options.to} (subject: ${options.subject})`,
			);
			return;
		}

		const fromAddress = this.configService.get<string>(
			'SMTP_USER',
			'no-reply@logisync.local',
		);

		try {
			await transporter.sendMail({
				from: fromAddress,
				to: options.to,
				subject: options.subject,
				text: options.text,
				html: options.html,
			});
			this.logger.debug(
				`Email delivered to ${options.to} (subject: ${options.subject})`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to send email to ${options.to}`,
				error instanceof Error ? error.stack : String(error),
			);
			throw error;
		}
	}

	private getTransporter(): Transporter | undefined {
		if (this.transporter) {
			return this.transporter;
		}

		const smtpHost = this.configService.get<string>('SMTP_HOST');
		const smtpUser = this.configService.get<string>('SMTP_USER');
		const smtpPass = this.configService.get<string>('SMTP_PASS');
		const smtpPort = this.configService.get<number>('SMTP_PORT', 587);

		if (!smtpHost || !smtpUser || !smtpPass) {
			return undefined;
		}

		this.transporter = nodemailer.createTransport({
			host: smtpHost,
			port: smtpPort,
			secure: smtpPort === 465,
			auth: { user: smtpUser, pass: smtpPass },
		});

		return this.transporter;
	}
}
