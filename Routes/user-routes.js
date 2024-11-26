const express=require('express');
const HttpError=require('../models/http-error');
const usersController=require('../controller/users-controller');
const fileupload=require('../middleware/file-upload');

const {check}=require('express-validator')
const router=express.Router();
// const DUMMY_PLACES=[
//     {
// 		id:'p1',
// 		title:'Jamshedpur',
// 		Description:'Steel City',
// 		location:{
// 			lat:22.7840284,
// 			lng: 86.1757708
// 		},
// 		address:'OC Road, Bistupur, 831001',
// 		creator:'u1'
// 	}
// ]
router.get('/',usersController.getUsers)


router.post('/signup',
    fileupload.single('image'),
    [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min: 5})
],usersController.signup)
router.post('/login',usersController.login)

module.exports=router;