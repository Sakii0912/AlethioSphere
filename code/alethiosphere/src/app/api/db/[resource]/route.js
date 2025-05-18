import {
	findDocuments,
	countDocuments,
	insertDocument
} from '@/lib/db';
import { parseQueryParams } from '@/lib/utils/query-parser';
import {
	successResponse,
	errorResponse,
	paginatedResponse,
	validationErrorResponse
} from '@/lib/utils/api-response';
import { withAuth } from '@/app/api/auth/server-jwt';
import { getResourceValidator } from '@/lib/validators';

export const GET = withAuth(async (request, { params }) => {
	try {
		const { resource } = await params;
		const { searchParams } = new URL(request.url);
		const queryOptions = parseQueryParams(searchParams);

		// Count total documents for pagination
		const total = await countDocuments(resource, queryOptions.filter);

		console.log(queryOptions.filter);
		const items = await findDocuments(resource, queryOptions.filter, {
			skip: queryOptions.skip,
			limit: queryOptions.limit,
			sort: queryOptions.sort,
			projection: queryOptions.projection
		});

		return paginatedResponse(items, {
			total,
			page: queryOptions.page,
			limit: queryOptions.limit,
			pages: Math.ceil(total / queryOptions.limit)
		});
	} catch (error) {
		console.error(`Error fetching ${(await params).resource} list:`, error);
		return errorResponse(`Failed to fetch ${(await params).resource} list`, 500, error.message);
	}
});

//POST endpoint for creating new resources
export const POST = withAuth(async (request, { params }) => {
	try {
		const { resource } = (await params);
		const data = await request.json();

		// Get validator for this resource if available
		const validator = getResourceValidator(resource);

		// Validate input if validator exists
		if (validator) {
			const validationResult = validator.validate(data);
			if (!validationResult.valid) {
				return validationErrorResponse(validationResult.errors);
			}
		}

		// Create document
		const newItem = await insertDocument(resource, data);

		return successResponse({ data: newItem }, 201, `${resource} created successfully`);
	} catch (error) {
		console.error(`Error creating ${(await params).resource}:`, error);
		return errorResponse(`Failed to create ${(await params).resource}`, 500, error.message);
	}
});