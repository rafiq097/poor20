const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const toIST = (date) => {
    const IST = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime());
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

        let timeI = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        await User.findByIdAndUpdate(user._id, { time: timeI }, { new: true });

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

const convert = (str) => {
    const date = new Date(str);
    return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

const extract = (arr) => {
    if (arr.length)
        return new Date(0);

    const last = arr[arr.length - 1];
    const time = last.split("-")[1]?.trim();

    return time ? new Date(time) : new Date(0);
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});

        users.sort((a, b) => {
            const lA = new Date(convert(a.time));
            const lB = new Date(convert(b.time));
            console.log(lA);
            console.log(lB);

            if (lA != lB) {
                return lB - lA;
            }

            const tA = extract(a.viewed);
            const tB = extract(b.viewed);
            console.log(tA);
            console.log(tB);

            return tB - tA;
        })

        res.status(200).send({ users: users });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { loginUser, getAllUsers };
