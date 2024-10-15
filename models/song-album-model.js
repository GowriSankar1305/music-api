const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumSchema = new Schema({
    album: {type: String,required: true},
    albumImagePath: {type: String,required: true},
    albumImageId: {type: String,required: true},
    albumImageMimeType: {type: String, required: true},
    year: {type: String,required: true},
    genre: {type: String,required: true},
    userId: {type: Schema.Types.ObjectId,ref:'User'},
    songs:[{type: Schema.Types.ObjectId,ref:'Song'}]
},{timestamps: true});

module.exports = mongoose.model('SongAlbum',albumSchema);
