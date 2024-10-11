const express = require("express");
const Router = express.Router;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const  { jwtuserpass } = require("../config");
const { UserModel, courseModel, purchaseModel } = require("../db");
const { z } = require('zod');
const { userMiddleware } = require("./middleware/user");
const { use } = require("bcrypt/promises");
require('dotenv').config();

const userRouter = Router();

userRouter.use(express.json());

userRouter.post("/signup", async function(req, res) {
    const requirebody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(100),
        firstname: z.string().min(3).max(100),
        lastname: z.string().min(3).max(100)
    })
    
    const parsedata = requirebody.safeParse(req.body);
    if(!parsedata.success) {
        res.json({
            message: "incorrect format",
            error: parsedata.error
        })
        return
    }
    
    const email = req.body.email;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;


    let errorThrown = false;
    try {
        const hashedpassword = await bcrypt.hash(password, 5); 
    
        await UserModel.create({
            email: email,
            password: hashedpassword,
            firstname: firstname,
            lastname:lastname
        });
    } catch(e) {
        res.json({
            message: "user already exists"
        })
        errorThrown = true;
    }
        if(!errorThrown) {
        res.json({
            message: "You are signed up"
        })
    }

})

userRouter.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email
    });

    if(!user) {
        res.json({
            message: "User does not exist"
        })
        return
    }

    const passwordmatch = await bcrypt.compare(password, user.password)

    if (passwordmatch) {
        const token = jwt.sign({
            id: user._id.toString()
        },jwtuserpass)

        res.json({
            token,
            user: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                userId: user._id
            }
        })
    } else {
        res.json({
            message: "Incorrect creds"
        })
    }

})

userRouter.get("/courses", userMiddleware, async function (req, res) {
    try {
        const courses = await courseModel.find({}); 
        if (courses.length > 0) {
            res.json({ 
                courses
            });
        } else {
            console.log("No courses found.");
            res.json({ message: "No courses found." });
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Error fetching courses" });
    }
});

userRouter.post("/purchase", userMiddleware, async function(req, res) {
    const { userId, courseId, title, description, price, type, imageUrl } = req.body;

    const existingPurchase = await purchaseModel.findOne({ userId: userId, courseId: courseId });
        
        if (existingPurchase) {
            return res.json({ message: 'You have already purchased this course.' });
        }

    try {
        const purchase = await purchaseModel.create({
            userId: userId,
            courseId: courseId,
            title: title,
            description: description,
            price: price,
            type: type,
            imageUrl: imageUrl
        });

        await purchase.save(); 

        res.status(200).json({ message: "Purchase successful" });
    } catch (error) {
        console.error("Error during course purchase:", error);
        res.status(500).json({ message: "Error purchasing course" });
    }

})

userRouter.get("/purchases", userMiddleware, async function(req, res) {
    try {
        const purchases = await purchaseModel.find({}); 
        if (purchases.length > 0) {
            res.json({ 
                purchases
            });
        } else {
            console.log("No purchases found.");
            res.json({ message: "No purchases found." });
        }
    } catch (error) {
        console.error("Error fetching purchases:", error);
        res.status(500).json({ message: "Error fetching purchases" });
    }
});

userRouter.delete("/account/:id", userMiddleware, async function (req, res) {
    const { id: userId } = req.params;

    try {
        const deletedaccnt = await UserModel.findByIdAndDelete(userId);

        if (!deletedaccnt) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.json({ message: "Account Deleted" });
    } catch (error) {
        console.error("Error deleting account", error);
        res.status(500).json({ message: "Error deleting account" });
    }
})

module.exports={
    userRouter:userRouter
}