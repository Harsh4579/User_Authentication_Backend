const express=require('express');
const path=require('path');
const fs=require('fs');
const bodyparser=require('body-parser');
const placesRoutes=require('./Routes/places-routes');
const usersRoutes=require('./Routes/user-routes');
const mongoose=require('mongoose')
const HttpError=require('./models/http-error');
const app=express();
app.use(bodyparser.json())
app.use('/uploads/images',express.static(path.join('uploads','images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});
app.use('/api/places',placesRoutes);
app.use('/api/users',usersRoutes);
app.use((req,res,next)=>{
    const error=new HttpError('Could not find this route',404);
    throw error;
});
app.use((error,req,res,next)=>{
    if(req.file){
        fs.unlink(req.file.path,err=>{
            cosole.log(err);
        });
    }
    if(res.headersSent){
        return next(error); 
    }
    res.status(error.code || 500);
    res.json({message:error.message ||'An errr Occurred'})
});
mongoose
    .connect('mongodb+srv://Harsh_new:meHyoIJ9qbmichrp@cluster0.s46dy.mongodb.net/mern?retryWrites=true&w=majority&appName=Cluster0')
    .then(()=>{
        app.listen(5000);
    })
    .catch(err=>{
        console.log(err);
    })
