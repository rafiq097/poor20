require("dotenv").config();
const cors = require('cors');

const express = require("express");
const app = express();

app.use(express.json());
app.use(cors());

//DB
const db = require("./db/db.js");
db(process.env.MONGO_URI);

//Routes
const userRoutes = require("./routes/user.routes.js");
const R20Routes = require("./routes/R20.routes.js");
const N20Routes = require("./routes/N20.routes.js");
app.use("/users", userRoutes);
app.use("/r20", R20Routes);
app.use("/n20", N20Routes);

//Middlewares

//Server
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.send("<h1>SAD</h1>");
})

app.listen(PORT, (req, res) => {
    console.log(`Server running on PORT ${PORT}`);
})