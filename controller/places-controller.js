const HttpError = require('../models/http-error');
const fs=require('fs');
const {validationResult}=require('express-validator');
const {v4:uuid}=require('uuid');
const Place=require('../models/places');
const User=require('../models/users');
const mongoose=require('mongoose');
// let DUMMY_PLACES=[
// 	{
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
// ];

const getPlacebyId=async(req,res,next)=>{
	const placeid=req.params.pid;
	let place;
	try{
		place=await Place.findById(placeid).exec();
	}catch(err){
		const error=new HttpError(
			'Something went wrong, Could not find place',500
		);
		return next(error)
	}
	if(!place)
	{
		// return res.status(404).json({message:'Could not find the place id'});
		const error=new HttpError('Could not find the place id',404);
		// error.code=404;
		// throw error;
		return next(error);
	}
	//console.log('Get Request In Places!');
	res.json({place: place.toObject({getters: true} ) });
}

const getPlacesbyUserId=async (req,res,next)=>{
	const userId=req.params.uid;
	// let places;
	let UserwithPlaces;
	try{
		UserwithPlaces=await User.findById(userId).populate('places');
	}catch(err)
	{
		const error=new HttpError(
			'Fetching places Failed, Please try later',500
		)
		return next(error);
	}

	if(!UserwithPlaces || UserwithPlaces.places.length===0)
		{
			// return res.status(404).json({message:'Could not find the user id'});
			return next(
				new HttpError('Could not find the user places id',404)
			);
		}
	res.json({places: UserwithPlaces.places.map(place=>place.toObject({getters: true} ))});
}
const createPlace=async (req,res,next)=>{             //get don't have a request body
	const errors=validationResult(req);         //post have request body 
	if(!errors.isEmpty()){
		console.log(errors);
		return next(new HttpError('Invalid inputs passed, please check the data entered', 422));
	}
    const {title,description,address,creator}=req.body;
    //const title=req.body.title
    const createdPlace=new Place({
		title,
        description,
        // location:coordinates,
        address,
		image: req.file.path,
        creator
	});
	let user;
	try{
		user=await User.findById(creator);
	}catch(err){
		const error=new HttpError(
			'Creating Place failed, Please try again',500
		);
		return next(error);
	}
	if(!user){
		const error=new HttpError(
			'Could not find User by provided ID',404
		)
		return next(error);
	}
	console.log(user);
    // DUMMY_PLACES.push(createPlace);
	try{
		// await createdPlace.save();
		const sess=await mongoose.startSession(); 
		sess.startTransaction();
		await createdPlace.save({session: sess});

		user.places.push(createdPlace);
		await user.save({session: sess});
		await sess.commitTransaction(); 
	}catch(err){
		const error=new HttpError(
			'Creating Place Failed, Please try again',500
		)
		return next(error);
	}
    res.status(201).json({place:createdPlace});
}
const updatePlace=async (req,res,next)=>{
	const { title, description } = req.body;
    const placeid=req.params.pid;
    let place;
	try{
		place=await Place.findById(placeid);
	}catch(err){
		const error=new HttpError(
			'Could not updated place',500
		)
		return next(error);
	}
	if (!place) {
        return next(new HttpError('Could not find the place to update', 404));
    }
    place.title=title;
    place.description=description;

    // DUMMY_PLACES[placeIndex]=updatePlace;
	try{
		await place.save();
	}catch(err){
		const error=new HttpError(
			'Could not updated place',500
		)
		return next(error);
	}

    res.status(200).json({place: place.toObject({getters: true})});
};
const deletePlace=async (req,res,next)=>{
    const placeId=req.params.pid;
	let place;
	try{
		place=await Place.findById(placeId).populate('creator');
	}catch(err){
		const error=new HttpError(
			'Could not Delete place',500
		);
		return next(error);
	}
	if (!place) {
        return next(new HttpError('Could not find the place to delete', 404));
    }
	const imagePath=place.image;

	try{
		// await place.deleteOne();
		const sess=await mongoose.startSession();
		sess.startTransaction();
		await place.deleteOne({session: sess});
		place.creator.places.pull(place);
		await place.creator.save({session: sess});
		await sess.commitTransaction();
	}catch(err){
		const error=new HttpError(
			'Could not Delete place',500
		);
		return next(error);
	}
	fs.unlink(imagePath,err=>{
		console.log(err);
	});
    res.status(200).json({message:'Deleted place'});
};
exports.getPlacebyId=getPlacebyId;
exports.getPlacesbyUserId=getPlacesbyUserId;
exports.createPlace=createPlace;
exports.updatePlace=updatePlace;
exports.deletePlace=deletePlace;