const express = require("express");
const Router = express.Router;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const  { jwtadminpass } = require("../config");
const { adminMiddleware } = require("./middleware/admin");
const { adminModel, courseModel, invitecodeModel } = require("../db");
const { z } = require('zod');
require('dotenv').config();

const adminRouter = Router();

adminRouter.use(express.json());

adminRouter.post("/signup", async function(req, res) {
    const requirebody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(100),
        firstname: z.string().min(3).max(100),
        lastname: z.string().min(3).max(100),
        invitecode: z.string().min(1)
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
    const invitecode = req.body.invitecode;

    let errorThrown = false;
    try {
        const invite = await invitecodeModel.findOne({ invitecode: invitecode });
        if (!invite) {
            res.json({
                message: "Invalid invite phrase or it has expired",
            });
            return;
        }

        const hashedpassword = await bcrypt.hash(password, 5); 
    
        await adminModel.create({
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

adminRouter.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await adminModel.findOne({
        email: email,
    });

    if(!admin) {
        res.json({
            message: "User does not exist"
        })
        return
    }

    const passwordmatch = await bcrypt.compare(password, admin.password)

    if (passwordmatch) {
        const token = jwt.sign({
            id: admin._id.toString()
        },jwtadminpass)

        res.json({
            token,
            admin: {
                email: admin.email,
                firstname: admin.firstname,
                lastname: admin.lastname,
                adminId: admin._id
            }
        })
    } else {
        res.json({
            message: "Incorrect creds"
        })
    }

})

adminRouter.post("/invite", adminMiddleware, async function(req, res) {
    function getRandomPhrase(wordCount) {
        const words = process.env.INVITE_PHRASES.split(',');
    
        let phrase = [];
        
        for (let i = 0; i < wordCount; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            phrase.push(words[randomIndex]);
        }
    
        return phrase.join(" ");
    }
    
    try {
        const adminId = req.userId;
        const randomPhrase = getRandomPhrase(5);
        
        const invite = await invitecodeModel.create({
            invitecode: randomPhrase,
            adminId: adminId,
        });
        await invite.save();

        res.json({
            message: "Random phrase generated and saved",
            invitecode: randomPhrase,
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating invite phrase", error: error.message });
    }
});

adminRouter.post("/course", adminMiddleware, async function(req, res) {
    const adminId = req.userId;

    console.log("Admin ID:", adminId);

    const { title, description, imageUrl, price, strikedprice, type } = req.body;

    try {
    const course = await courseModel.create({
        title: title, 
        description: description, 
        imageUrl: imageUrl, 
        price: price, 
        strikedprice: strikedprice,
        type: type,
        creatorId: adminId
    })

    res.json({
        message: "Course Created",
        courseId: course._id
    })
    } catch (error) {
        console.error("Error in creating course:", error);  
    }

})

adminRouter.get("/courses", adminMiddleware, async function(req, res) {
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

adminRouter.delete("/course/:id", adminMiddleware, async function(req, res) {
    const { id } = req.params;

    try {
        const deletedCourse = await courseModel.findByIdAndDelete(id); 
        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course Deleted" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Error deleting course" });
    }
});

adminRouter.delete("/account/:id", adminMiddleware, async function (req, res) {
    const { id: adminId } = req.params;

    try {
        const deletedaccnt = await adminModel.findByIdAndDelete(adminId);

        if (!deletedaccnt) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.json({ message: "Account Deleted" });
    } catch (error) {
        console.error("Error deleting account", error);
        res.status(500).json({ message: "Error deleting account" });
    }
})

module.exports = {
    adminRouter: adminRouter
}