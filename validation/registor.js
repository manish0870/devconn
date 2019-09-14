const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = {};

    if (!validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Name must be in between 2 to 30 characters';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
