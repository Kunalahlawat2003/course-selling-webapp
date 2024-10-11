const mongoose = require('mongoose');
const { number } = require('zod');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL, {
}).then(() => {
    console.log("MongoDB connection established successfully");
}).catch((err) => {
    console.error("Error connecting to MongoDB: ", err);
});

const User = new Schema({
    email: {type:  String, unique: true},
    password: String,
    firstname: String,
    lastname: String
});

const admin = new Schema({
    email: {type:  String, unique: true},
    password: String,
    firstname: String,
    lastname: String
});

const invitecode = new Schema({
    invitecode: {type: String, unique: true},
    adminId: String,
    createdAt: { type: Date, default: Date.now, expires: 3600 }
})

const course = new Schema({
    title: String,
    description: String,
    price: { type: mongoose.Schema.Types.Mixed },
    imageUrl: String,
    strikedprice: Number,
    type: {type: String},
    creatorId: ObjectId
});

const purchase = new Schema({
    userId: ObjectId,
    courseId: ObjectId,
    title: String,
    description: String,
    price: Schema.Types.Mixed,
    type: String,
    imageUrl: String,
    purchaseDate: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('users', User);
const adminModel = mongoose.model('admin', admin);
const invitecodeModel = mongoose.model('invitecode', invitecode);
const courseModel = mongoose.model('course', course);
const purchaseModel = mongoose.model('purchase', purchase);

module.exports ={
    UserModel,
    adminModel,
    courseModel,
    purchaseModel,
    invitecodeModel
}