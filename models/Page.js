const mongoose = require('mongoose');
const WordSchema = require('./Word');

const PageSchema = mongoose.Schema({
    page_number: {
        type: Number,
        required: true
    },
    orientation: {
        type: mongoose.Decimal128,
        required: true
    },
    width: {
        type: mongoose.Decimal128,
        required: true
    },
    height: {
        type: mongoose.Decimal128,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    words: {
        type: [WordSchema.schema],
        required: true
    }
});

module.exports = {
    model: mongoose.model('Pages', PageSchema),
    schema: PageSchema
};
