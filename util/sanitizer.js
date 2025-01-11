// util/sanitizer.js

const validator = require('validator');

const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return validator.trim(validator.escape(input));
    }
    return input;
};

module.exports = sanitizeInput;
