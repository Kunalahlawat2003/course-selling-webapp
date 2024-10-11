const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();
const path = require('path');
const axios = require('axios');

const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/course", courseRouter);
const PORT = process.env.PORT || 3000;


 async function main() {
    await mongoose.connect(process.env.MONGO_URL)
}

const url = `https://course-selling-webapp.onrender.com`; // Replace with your Render URL
const interval = 30000; // Interval in milliseconds (30 seconds)

function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}

setInterval(reloadWebsite, interval);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

main()
