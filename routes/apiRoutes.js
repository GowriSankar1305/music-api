const ALLOWED_FILE_TYPES = /mp3/;
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api-controller');
const {body} = require('express-validator');
const path = require('path');
const authUtility = require('../middleware/token-validator');
const {v4: uuidv4} = require('uuid');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req,file,cb) => cb(null,'uploads'),
    filename: (req,file,cb) => cb(null, uuidv4() + '.mp3')
});
const fileFilter = (req,file,cb) => {
    console.log('file----> ',file);
    const extname = ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase());
    console.log('extname---> ',extname);
    if(extname) { cb(null,true); }
    else { cb(new Error('Invalid file type'),false); }
};
const upload = multer({storage: storage,fileFilter: fileFilter});

router.get('/music/welcome',apiController.showWelcomeData);
router.post('/music/register',[
    body('emailId','Invalid email id').isEmail(),
    body('fullName','Full name cannot be empty').trim().notEmpty(),
    body('mobileNo','Mobile no cannot be empty').trim().notEmpty(),
    body('userPassword','Passwrd cannot be empty').trim().notEmpty()
],apiController.registerUser);
router.post('/music/login',[
    body('emailId','Email id is invalid').isEmail(),
    body('userPassword','Password cannot be empty').trim().notEmpty()
],apiController.loginTheUser);
router.post('/music/upload',authUtility.validateToken,upload.single('song'),apiController.uploadSong);
router.get('/music/song/download/:fileId',authUtility.validateToken,apiController.downloadSong);
router.post('/music/playlists/add',authUtility.validateToken,[
    body('playlistName','play list name cannot be empty').trim().notEmpty()
],apiController.createPlaylist);
router.post('/music/user/playlists',authUtility.validateToken,apiController.findPlaylistsOfUser);
router.post('/music/playlists/song/add',authUtility.validateToken,[
    body('songId','Song id cannot be empty').trim().notEmpty(),
    body('playListId','Playlist id cannot be empty').trim().notEmpty(),
],apiController.addSongToPlaylist);
router.post('/music/user/playlist/songs',authUtility.validateToken,[
    body('playlistId','Playlist id cannot be empty').trim().notEmpty()
],apiController.findSongsOfPlaylist);
router.get('/music/image/download/:imageId',authUtility.validateToken,apiController.downloadAlbumImage);
router.get('/music/song/image/download/:songId',authUtility.validateToken,apiController.downloadAlbumImageBySong);
router.post('/music/user/albums',authUtility.validateToken,apiController.findUserAlbums);
router.post('/music/album/songs',authUtility.validateToken,apiController.findSongsOfAlbum);
module.exports = router;