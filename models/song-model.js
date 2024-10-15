const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    originalFileName: {type: String,required: true},
    generatedFileName: {type: String,required: true},
    mimeType: {type: String,required: true},
    filePath: {type: String,required: true},
    performerInfo: {type: String},
    composer: {type: String},
    title: {type: String,required: true},
    artist: {type: String},
    trackNumber: {type: String},
    userId: {type:Schema.Types.ObjectId,ref:'User'},
    album: {type:Schema.Types.ObjectId,ref:'SongAlbum'}
},{timestamps: true});

module.exports = mongoose.model('Song',songSchema);