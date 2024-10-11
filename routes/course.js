const express = require("express");
const { courseModel, purchaseModel } = require("../db");
require('dotenv').config();
const Router = express.Router;

const courseRouter = Router();

courseRouter.get("/preview", async function(req, res) {
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
})

module.exports = {
    courseRouter: courseRouter
}