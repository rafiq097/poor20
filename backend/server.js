require("dotenv").config();
const cors = require('cors');

const express = require("express");
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
// app.use(cors());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
const verifyToken = require("./middlewares/auth.js");
app.get('/verify', verifyToken, (req, res) => {
    console.log("Token Verified");

    res.status(200).json({
        message: "Logged In Successfully",
        token: req.token,
        user: req.user
    })
});

//Server
const PORT = process.env.PORT || 5000;
// app.get("/", (req, res) => {
//     res.send("<h1>SAD</h1>");
// })
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, (req, res) => {
    console.log(`Server running on PORT ${PORT}`);
})