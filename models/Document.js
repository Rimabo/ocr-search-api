const mongoose = require('mongoose');
const PageSchema = require('./Page');

const DocumentSchema = mongoose.Schema({
    url: {
        type: String,
        unique: true,
        required: true
    },
    pages: {
        type: [PageSchema.schema],
        required: true
    },
    createdAt: {
        type: Date,
        expires: 43200,
        default: Date.now
    }
});

module.exports = mongoose.model('Documents', DocumentSchema);
