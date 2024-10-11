const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");
const app = express();

app.use(cors());
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/course", courseRouter);
const PORT = process.env.PORT || 3000;


 async function main() {
    await mongoose.connect(process.env.MONGO_URL)
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

main()