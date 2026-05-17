import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ObjectStorageService } from '../../../infrastructure/object-storage/object-storage.service';
import type { ExportOrdersQueryDto } from '../dtos/order.dto';

export interface RenderedOrderExport {
	contentType: string;
	filename: string;
	buffer: Buffer;
	objectName?: string;
	downloadUrl?: string;
}

@Injectable()
export class OrderExportService {
	private readonly logger = new Logger(OrderExportService.name);

	constructor(private readonly objectStorageService: ObjectStorageService) {}

	async renderAndStore(
		query: ExportOrdersQueryDto,
		orders: Record<string, unknown>[],
	): Promise<RenderedOrderExport> {
		const rendered =
			query.format === 'pdf'
				? this.renderPdfExport(orders)
				: this.renderXlsxExport(orders);

		const stored = await this.storeIfAvailable(query, rendered.buffer);

		return {
			...rendered,
			...stored,
		};
	}

	private renderXlsxExport(orders: Record<string, unknown>[]) {
		const rows = orders.map((order) => ({
			id: order.id,
			quotationId: order.quotationId,
			buyerWorkspaceId: order.buyerWorkspaceId,
			supplierWorkspaceId: order.supplierWorkspaceId,
			status: order.status,
			assignedTo: order.assignedTo,
			totalPrice: order.totalPrice,
			createdAt: this.formatExportValue(order.createdAt),
		}));
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(rows);
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

		return {
			contentType:
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			filename: 'orders.xlsx',
			buffer: XLSX.write(workbook, {
				bookType: 'xlsx',
				type: 'buffer',
			}) as Buffer,
		};
	}

	private renderPdfExport(orders: Record<string, unknown>[]) {
		const lines = [
			'LogiSync Order Export',
			`Generated at: ${new Date().toISOString()}`,
			`Total orders: ${orders.length}`,
			'',
			...orders.map(
				(order) =>
					`${String(order.id)} | ${String(order.status)} | ${String(order.totalPrice)}`,
			),
		];
		const content = [
			'BT',
			'/F1 10 Tf',
			'50 780 Td',
			...lines.flatMap((line, index) => [
				index === 0 ? '' : '0 -14 Td',
				`(${this.escapePdfText(line)}) Tj`,
			]),
			'ET',
		]
			.filter(Boolean)
			.join('\n');
		const objects = [
			'<< /Type /Catalog /Pages 2 0 R >>',
			'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
			'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
			'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
			`<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`,
		];
		let body = '%PDF-1.4\n';
		const offsets = [0];
		for (const [index, object] of objects.entries()) {
			offsets.push(Buffer.byteLength(body, 'utf8'));
			body += `${index + 1} 0 obj\n${object}\nendobj\n`;
		}
		const xrefOffset = Buffer.byteLength(body, 'utf8');
		body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
		body += offsets
			.slice(1)
			.map((offset) => `${offset.toString().padStart(10, '0')} 00000 n \n`)
			.join('');
		body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

		return {
			contentType: 'application/pdf',
			filename: 'orders.pdf',
			buffer: Buffer.from(body, 'utf8'),
		};
	}

	private async storeIfAvailable(
		query: ExportOrdersQueryDto,
		buffer: Buffer,
	): Promise<Pick<RenderedOrderExport, 'objectName' | 'downloadUrl'>> {
		if (!this.objectStorageService.isReady()) {
			return {};
		}

		const objectName = [
			'exports/orders',
			`${query.start_date.toISOString()}_${query.end_date.toISOString()}.${query.format}`,
		].join('/');

		try {
			await this.objectStorageService.uploadFile(objectName, buffer);
			return {
				objectName,
				downloadUrl:
					await this.objectStorageService.generateSignedUrl(objectName),
			};
		} catch (error) {
			this.logger.warn(
				`Order export object storage write skipped: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return {};
		}
	}

	private escapePdfText(value: string): string {
		return value
			.replace(/\\/g, '\\\\')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)');
	}

	private formatExportValue(value: unknown) {
		return value instanceof Date ? value.toISOString() : value;
	}
}
