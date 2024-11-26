// const {v4:uuid}=require('uuid');
const {validationResult}=require('express-validator');
const HttpError= require('../models/http-error');
const jwt=require('jsonwebtoken');
const User=require('../models/users');
const bcrypt= require('bcryptjs');
// const DUMMY_USER=[
//     {
//         id:'u1',
//         name:'Harsh',
//         email:'harsh@gmail.com',
//         password:'harsh123'
//     }
// ];

const getUsers=async (req,res,next)=>{
    // res.json({users: DUMMY_USER});
    let users;
    try{
        users= await User.find({},'-password');

    }catch(err)
    {
        // console.errors(err);
        const error=new HttpError(
            'Fetching User failed',500
        );
        return next(error);
    }
    // if (!users || users.length === 0) {
    //     return res.status(404).json({ message: 'No users found.' });
    // }
    res.json({users: users.map(user=>user.toObject({getters: true}))});
};

const signup=async (req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
		console.log(errors);
        return next(
            new HttpError('Username/Password is not valid',422)
        )
	}
    const {name,email,password}=req.body;
    // const hasuser=DUMMY_USER.find(u=>u.email===email);
    let existingUser;
    try{
        existingUser=await User.findOne({email:email});
    }catch(err)
    {
        const error=new HttpError(
            'Signing up failed, Please try again later',500
        )
        return next(error);
    }
    if(existingUser){
        const error=new HttpError(
            'User exists already',422
        )
        return next(error);
    }
    let hashedPassword;
    try{
        hashedPassword=await bcrypt.hash(password,12);
    }catch(err){
        const error=HttpError('Could not create User, Please try again',500);
        return next(error);
    }
    const createdUser=new User({
        name,
        email,
        password: hashedPassword,
        image:req.file.path,
        places: []
    })
    // DUMMY_USER.push(createdUser);
    try{
		await createdUser.save();
	}catch(err){
		const error=new HttpError(
			'Creating Place Failed, Please try again',500
		)
		return next(error);
	}
    let token;
    try{
        token=jwt.sign({userId: createdUser.id,email: createdUser.email},'supersecret',{expiresIn: '1hr'});
    }catch(err){
        const error=new HttpError(
            'Signing up failed, Please try again later',500
        )
        return next(error);
    }
    res.status(201).json({userId: createdUser.id,email: createdUser.email,token: token});
};
const login=async (req,res,next)=>{
    const {email,password}=req.body;
    let existingUser;
    try{
        existingUser=await User.findOne({email:email});
    }catch(err)
    {
        const error=new HttpError(
            'Logging in failed, Please try again later',500
        )
        return next(error);
    }
    if(!existingUser)
    { 
        const error=new HttpError(
            'Could not Log you in',401
        );
        return next(error);
    }
    let isValidPassword=false;
    try{
        isValidPassword=await bcrypt.compare(password,existingUser.password)
    }catch(err){
        const error=new HttpError('Could not log you in, Please check your credentials',500);
        return next(error);
    }
    if(!isValidPassword){
        const error=new HttpError('Invalid Credentials, Could not log you in',401);
        return next(error);
    }

    let token;
    try{
        token=jwt.sign({userId: existingUser.id,email: existingUser.email},'supersecret',{expiresIn: '1hr'});
    }catch(err){
        const error=new HttpError(
            'Logging In failed, Please try again later',500
        )
        return next(error);
    }
    res.json({userId: existingUser.id,
        email: existingUser.email,
        token: token});
};

exports.getUsers=getUsers;
exports.login=login;
exports.signup=signup;