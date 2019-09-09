const mongoose = require('mongoose');

const WordSchema = mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    bounding_box: {
        type: [mongoose.Decimal128],
        required: true
    }
});

module.exports = {
    model: mongoose.model('Words', WordSchema),
    schema: WordSchema
};
