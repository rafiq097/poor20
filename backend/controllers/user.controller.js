const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const toIST = (date) => {
    const IST = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + IST);
};

const loginUser = async (req, res) => {
    console.log("login called");
    try {
        console.log(req.body);
        const { email, name } = req.body;
        if (!email || !name)
            return res.status(400).json({ message: "Incorrect Details" });

        let user = await User.findOne({ email: email });
        if (!user) {
            user = new User({ email, name });
            await user.save();
            console.log(user);
        }

        const currentIST = toIST(new Date());
        await User.findByIdAndUpdate(user._id, { time: currentIST }, { new: true });

        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: "Logged In Successfully",
            token,
            user: {
                id: user._id, email: user.email, name: user.name
            }
        });
    }

    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send({ users: users });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { loginUser, getAllUsers };