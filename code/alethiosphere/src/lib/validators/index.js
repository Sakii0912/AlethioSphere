// src/lib/validators/index.js
import { userValidator } from './user-validator';
import { entryValidator } from './entry-validator';
// Import other validators as needed

const validators = {
	users: userValidator,
	posts: entryValidator,
	// Add more validators for other resources
};

export function getResourceValidator(resource) {
	return validators[resource] || null;
}