const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSChema = new Schema({
    playlistName: {type: String,required: true},
    userId: {type: Schema.Types.ObjectId, required: true},
    songs: [{type: Schema.Types.ObjectId}]
},{timestamps: true});

module.exports = mongoose.model('UserPlayList',playlistSChema);