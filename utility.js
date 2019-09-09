const validate = require('validate.js');

const urlValidationConstraints = {
    website: {
        url: {
            schemes: ["http", "https", "file"],
            allowLocal: true
        }
    }
};

function validateUrl(url){
    const attributes = {website: url};
    let validationResult = validate(attributes, urlValidationConstraints);
    if (validationResult)
        throw(validationResult.website);
    else
        return true
}

module.exports = {
    validateUrl: validateUrl
};
