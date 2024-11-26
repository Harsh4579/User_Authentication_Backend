const express=require('express');
const {check}=require('express-validator')
const HttpError=require('../models/http-error');
const placesController=require('../controller/places-controller');
const fileupload= require('../middleware/file-upload');
const checkAuth=require('../middleware/check-auth');
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
router.get('/:pid',placesController.getPlacebyId)

router.get('/user/:uid',placesController.getPlacesbyUserId)
router.use(checkAuth)
router.post('/',
	fileupload.single('image'),
	[check('title').not().isEmpty(),check('description').isLength({min: 5}),check('address').not().isEmpty()],placesController.createPlace)
router.patch('/:pid',[
	check('title').not().isEmpty(),
	check('description').isLength({min: 5})
],placesController.updatePlace)
router.delete('/:pid',placesController.deletePlace)

module.exports=router;