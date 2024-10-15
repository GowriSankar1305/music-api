const express = require('express');
const bodyParser = require('body-parser');
const appRoutes = require('./routes/apiRoutes');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','*');
    res.setHeader('Access-Control-Allow-Methods','*');
    next();
});
app.use(appRoutes);
mongoose.connect('mongodb://localhost:27017/muzik')
.then(resp => {
    console.log('************** database connected **************');
    app.listen(9009);
}).catch(err => {
    console.log(err);
});
