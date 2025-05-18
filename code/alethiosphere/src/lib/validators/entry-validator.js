import {ObjectId} from "mongodb";

export const entryValidator = {
	validate(data) {
		const errors = {};

		// Required fields
		if (!data.timestamp) {
			errors.timestamp = 'Timestamp is required';
		}

		if (!data.user_id) {
			errors.user_id = 'User reference is required';
		} else if (!ObjectId.isValid(data.user_id)) {
			errors.user_id = 'Invalid user ID format';
		}

		if (!data.transcript) {
			errors.transcript = 'Transcript is required';
		}

		return {
			valid: Object.keys(errors).length === 0,
			errors
		};
	},
};

function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}