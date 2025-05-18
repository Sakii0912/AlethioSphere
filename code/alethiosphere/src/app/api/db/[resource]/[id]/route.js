import {
	findDocumentById,
	updateDocument,
	deleteDocument
} from '@/lib/db';
import {
	successResponse,
	errorResponse,
	notFoundResponse,
	validationErrorResponse
} from '@/lib/utils/api-response';
import {extractTokenFromCookies, extractTokenFromHeader, withAuth} from '@/app/api/auth/server-jwt';
import { getResourceValidator } from '@/lib/validators';
import { ObjectId } from 'mongodb';

// Helper function to validate resource ID
function validateId(id) {
	if (!ObjectId.isValid(id)) {
		return { valid: false, message: 'Invalid ID format' };
	}
	return { valid: true };
}

export const GET = withAuth(async (request, { params }) => {
	try {
		const { resource, id } = await params;

		if (resource === 'users') {
			let jwt = extractTokenFromHeader(request) || extractTokenFromCookies(request);
		}

		// Validate ID
		const idValidation = validateId(id);
		if (!idValidation.valid) {
			return errorResponse(idValidation.message, 400);
		}

		// Fetch the document
		const item = await findDocumentById(resource, id);

		if (!item) {
			return notFoundResponse(resource);
		}

		return successResponse({ data: item });
	} catch (error) {
		console.error(`Error fetching ${(await params).resource}:`, error);
		return errorResponse(`Failed to fetch ${(await params).resource}`, 500, error.message);
	}
});

// endpoint for updating existing resources
export const PATCH = withAuth(async (request, { params }) => {
	try {
		const { resource, id } = (await params);

		// Validate ID
		const idValidation = validateId(id);
		if (!idValidation.valid) {
			return errorResponse(idValidation.message, 400);
		}

		// Check if item exists
		const existingItem = await findDocumentById(resource, id);
		if (!existingItem) {
			return notFoundResponse(resource);
		}

		// Get the update data
		const updateData = await request.json();

		// Validate update data
		if (Object.keys(updateData).length === 0) {
			return errorResponse('No update data provided', 400);
		}

		// Get validator for this resource if available
		const validator = getResourceValidator(resource);

		// Validate input if validator exists (partial validation for PATCH)
		if (validator && validator.validatePartial) {
			const validationResult = validator.validatePartial(updateData);
			if (!validationResult.valid) {
				return validationErrorResponse(validationResult.errors);
			}
		}

		// Sanitize update data - prevent overwriting protected fields
		const protectedFields = ['_id', 'createdAt'];
		const sanitizedUpdate = { ...updateData };

		protectedFields.forEach(field => {
			if (field in sanitizedUpdate) {
				delete sanitizedUpdate[field];
			}
		});
		console.log('Sanitized update data:', sanitizedUpdate);

		const updateQuery = {$set: sanitizedUpdate};
		const updatedItem = await updateDocument(resource, id, updateQuery);

		if (!updatedItem) {
			return errorResponse(`Failed to update ${resource}`, 500);
		}

		return successResponse(
			{ data: updatedItem },
			200,
			`${resource} updated successfully`
		);
	} catch (error) {
		console.error(`Error updating ${(await params).resource}:`, error);
		return errorResponse(`Failed to update ${(await params).resource}`, 500, error.message);
	}
});

export const PUT = withAuth(async (request, { params }) => {
	try {
		const { resource, id } = (await params);

		// Validate ID
		const idValidation = validateId(id);
		if (!idValidation.valid) {
			return errorResponse(idValidation.message, 400);
		}

		// Check if item exists
		const existingItem = await findDocumentById(resource, id);
		if (!existingItem) {
			return notFoundResponse(resource);
		}

		// Get replacement data
		const replacementData = await request.json();

		// Get validator for this resource if available
		const validator = getResourceValidator(resource);

		// For PUT, we need complete validation
		if (validator) {
			const validationResult = validator.validate(replacementData);
			if (!validationResult.valid) {
				return validationErrorResponse(validationResult.errors);
			}
		}

		// Preserve immutable fields from the original document
		const preservedFields = {
			_id: existingItem._id,
			createdAt: existingItem.createdAt
		};

		// Combine preserved fields with new data
		const sanitizedData = {
			...replacementData,
			...preservedFields
		};

		// Update the document with the sanitized data
		const updatedItem = await updateDocument(
			resource,
			id,
			sanitizedData
		);

		if (!updatedItem) {
			return errorResponse(`Failed to replace ${resource}`, 500);
		}

		return successResponse(
			{ data: updatedItem },
			200,
			`${resource} replaced successfully`
		);
	} catch (error) {
		console.error(`Error replacing ${(await params).resource}:`, error);
		return errorResponse(`Failed to replace ${(await params).resource}`, 500, error.message);
	}
});

// endpoint for deleting resources
export const DELETE = withAuth(async (request, { params }) => {
	try {
		const { resource, id } = (await params);

		// Validate ID
		const idValidation = validateId(id);
		if (!idValidation.valid) {
			return errorResponse(idValidation.message, 400);
		}

		// Check if item exists
		const existingItem = await findDocumentById(resource, id);
		if (!existingItem) {
			return notFoundResponse(resource);
		}

		// Delete the document
		const deleted = await deleteDocument(resource, id);

		if (!deleted) {
			return errorResponse(`Failed to delete ${resource}`, 500);
		}

		return successResponse(
			{ id },
			200,
			`${resource} deleted successfully`
		);
	} catch (error) {
		console.error(`Error deleting ${(await params).resource}:`, error);
		return errorResponse(`Failed to delete ${(await params).resource}`, 500, error.message);
	}
});
