/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RbacGuard } from '../../../core/security/rbac.guard';
import type { JwtPayload } from '../../iam/auth/auth.dto';
import { JwtAuthGuard } from '../../iam/auth/jwt-auth.guard';
import { ProductSearchQueryDto } from './product-search.dto';
import { ProductSearchService } from './product-search.service';

@ApiTags('Sourcing - Product Search')
@Controller('products')
@ApiBearerAuth('access-token')
export class ProductSearchController {
	constructor(private readonly productSearchService: ProductSearchService) {}

	@Get('search')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('buyer_staff', 'buyer_manager', 'company_admin')
	@ApiOperation({
		summary: 'Cross-tenant product search for Buyers (US-61)',
		description:
			'Pagination capped at 25 items per QAR-05. Reputation scores are read from Redis cache only. ' +
			'When `supplierWorkspaceIds` is provided it is persisted to Redis (24h TTL, BR-384) and ' +
			'reused as the default filter on subsequent requests omitting the parameter.',
	})
	@ApiQuery({ name: 'keyword', required: false, type: 'string' })
	@ApiQuery({ name: 'catalogCategoryId', required: false, type: 'string' })
	@ApiQuery({ name: 'minPrice', required: false, type: 'number' })
	@ApiQuery({ name: 'maxPrice', required: false, type: 'number' })
	@ApiQuery({
		name: 'supplierWorkspaceIds',
		required: false,
		type: 'string',
		isArray: true,
		description: 'Repeatable query param or comma-separated UUIDs',
	})
	@ApiQuery({
		name: 'sortBy',
		required: false,
		enum: ['relevance', 'price', 'reputation_score'],
	})
	@ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
	@ApiQuery({ name: 'limit', required: false, type: 'number' })
	@ApiQuery({ name: 'offset', required: false, type: 'number' })
	@ApiResponse({ status: 200, description: 'Paginated cross-tenant products' })
	async search(@Query() query: ProductSearchQueryDto, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		return this.productSearchService.search(
			query,
			payload.workspaceId,
			payload.sub,
		);
	}
}
