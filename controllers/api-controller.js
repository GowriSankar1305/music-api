const {validationResult} = require('express-validator');
const User = require('../models/user-model');
const Song = require('../models/song-model');
const UserPlayList = require('../models/user-playlist');
const SongAlbum = require('../models/song-album-model');
const mimeMap = require('../middleware/mime-type-map');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeID3 = require('node-id3');
const {v4: uuidv4} = require('uuid');
const JWT_SECRET = '(Nycci9fSVO_]h>jpF!Nn~fy]16kZa24stTERI1~%j4.~6(9iV';
const path = require('path');
const fs = require('fs');

exports.showWelcomeData = (req,res,next) => {
    res.status(200).json({'message':'Welcome to our application'});
};

exports.registerUser = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())    {
        return res.status(400).json({'errors': errors.array()});
    }
    else    {
        User.findOne({emailId: req.body.emailId}).then(userDoc => {
            if(userDoc)    {
                return res.status(400).json({'message':'User already exists'});
            }
            else    {
                User.findOne({mobileNo: req.body.mobileNo}).then(userDoc2 => {
                    if(userDoc2)    {
                        return res.status(400).json({'message':'Mobile no already exists'}); 
                    }
                    bcrypt.hash(req.body.userPassword,12).then(hashedPwd => {
                        const newUser = new User({
                            emailId: req.body.emailId,
                            mobileNo: req.body.mobileNo,
                            fullName: req.body.fullName,
                            password: hashedPwd
                        });
                        console.log('user details------> ',newUser);
                        newUser.save().then(result => {
                            return res.status(201).json({'message':'Account created successfully'});
                        }).catch(err => {
                            console.log(err);
                            return res.status(500).json({'message':'Unable to create account'});
                        });
                    });
                });
            }
        });
    }
};

exports.loginTheUser = (req,res,next) => {
 const errors = validationResult(req); 
 if(!errors.isEmpty())    {
    return res.status(400).json({'errors': errors.array()});
 }
 else   {
    User.findOne({emailId: req.body.emailId}).then(userDoc => {
        if(!userDoc) {
            return res.status(400).json({'message':'Invalid Email id or password'});
        }
        else    {
            bcrypt.compare(req.body.userPassword,userDoc.password).then(doMatch => {
                if(!doMatch) {
                    return res.status(400).json({'message':'Invalid Email id or password'});
                }
                else   {
                    const claims = {principalId: userDoc.id,emailId: userDoc.emailId}
                    const jwtToken = jwt.sign(claims,JWT_SECRET,{expiresIn: '1h'});
                    return res.status(200).json({'message':'Login successful','token':jwtToken});
                }
            });
        }
    });
 }  
}

exports.uploadSong = async (req,res,next) => {
    const audioBuffer = fs.readFileSync(req.file.path);
    const metadata = nodeID3.read(audioBuffer);
    let albumDoc = await SongAlbum.findOne({album: metadata.album});
    console.log('metadat-----> ',metadata);
    if(!albumDoc)    {
        const imgDirectory = path.join(__dirname,'../images');
        const imgId = uuidv4() + mimeMap.fetchExtension(metadata.image.mime);
        const imagePath = `${imgDirectory}/${imgId}`;
        fs.writeFileSync(imagePath,metadata.image.imageBuffer);
        let newAlbum = new SongAlbum({
            album: metadata.album,
            genre: metadata.genre,
            year: metadata.year,
            albumImageId: imgId,
            albumImageMimeType: metadata.image.mime,
            albumImagePath: imagePath,
            userId: req.currentId
        });
        albumDoc = await newAlbum.save();
    }
    let newSong = new Song({
        filePath: req.file.path,
        generatedFileName: req.file.filename,
        mimeType: req.file.mimetype,
        originalFileName: req.file.originalname,
        userId: req.currentId,
        composer: metadata.composer,
        performerInfo: metadata.performerInfo,
        trackNumber: metadata.trackNumber,
        title: metadata.title,
        artist: metadata.artist,
        album: albumDoc._id
    });
    newSong = await newSong.save();
    albumDoc.songs.push(newSong._id);
    albumDoc = await albumDoc.save();
    res.status(200).json({'message': 'Song uploaded successfully'});
};

exports.downloadSong = (req,res,next) => {
    const fileId = req.params.fileId;
    const filePath = path.join(__dirname,'../uploads',fileId);
    console.log('path------>',filePath);
    fs.access(filePath,fs.constants.F_OK, (err) => {
        if(err) { return res.status(400).json({'message': 'File not found'}) }
        res.sendFile(filePath);
    });
};

exports.createPlaylist = async (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())    {
        return res.status(400).json({'errors': errors.array()});
    }
    const name = req.body.playlistName;
    let response = await UserPlayList.findOne({playlistName: name});
    if(response)    {
        return res.status(400).json({'message':'Playlist name already exists!'});
    }
    let newPlayList = new UserPlayList({
        playlistName: name,
        userId: req.currentId
    });
    newPlayList = await newPlayList.save();
    res.status(200).json({'message':`Playlist ${newPlayList.playlistName} created successfully with id ${newPlayList._id}!`});
};

exports.addSongToPlaylist = async (req,res,next) => {
    const songId = req.body.songId;
    const playListId = req.body.playListId;
    const song = await Song.findById(songId);
    let playList = await UserPlayList.findById(playListId);
    let errors = new Array();
    if(!song)   {
        errors.push('Invalid song id');
    }
    if(!playList)    {
        errors.push('Invalid play list id');
    }
    if(errors.length > 0)   {
        return res.status(400).json({'errors': errors});
    }
    playList.songs.push(song._id);
    playList = await playList.save();
    res.status(200).json({'message': 'Song added to playlist!'});
};

exports.findPlaylistsOfUser = async (req,res,next) => {
    const userId = req.currentId;
    let playlistArray = await UserPlayList.find({userId: userId},{playlistName: true,_id: true});
    res.status(200).json({'playlists': playlistArray});
};

exports.findSongsOfPlaylist = async (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())    {
        return res.status(400).json({'errors': errors.array()});
    }
    else    {
        const id = req.body.playlistId;
        let playlist = await UserPlayList.findById(id).populate('songs');
        if(!playlist)    {
            return res.status(400).json({'message': 'Invalid playlist id'});
        }
        return res.status(200).json({'songs':playlist.songs}); 
    }
};

exports.findUserAlbums = async (req,res,next) => {
    console.log('currentid------> ',req.currentId);
    const userId = req.currentId;
    let albums = await SongAlbum.find({userId: userId},
        {album:true,albumImageId:true,genre: true,year:true,albumImageMimeType:true,_id:true});
    res.status(200).json({albums});
};

exports.downloadAlbumImage = (req,res,next) => {
    const filePath = path.join(__dirname,'../images',req.params.imageId); 
    fs.access(filePath,fs.constants.F_OK, (err) => {
        if(err) { return res.status(400).json({'message': 'File not found'}) }
        res.sendFile(filePath);
    });
};

exports.findSongsOfAlbum = async (req,res,next) => {
    const id = req.body.albumId;
    let album = await SongAlbum.findById(id).populate('songs');
    res.status(200).json({'songs':album.songs});
};

exports.downloadAlbumImageBySong = async (req,res,next) => {
    const id = req.params.songId;
    let song = await Song.findById(id).populate('album');
    const filePath = path.join(__dirname,'../images',song.album.albumImageId); 
    fs.access(filePath,fs.constants.F_OK, (err) => {
        if(err) { return res.status(400).json({'message': 'File not found'}) }
        res.sendFile(filePath);
    });
};