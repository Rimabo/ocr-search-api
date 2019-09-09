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
        type: [WordSchema],
        required: true
    }
});

const DocumentSchema = mongoose.Schema({
    url: {
        type: String,
        unique: true,
        required: true
    },
    pages: {
        type: [PageSchema],
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Documents', DocumentSchema);
