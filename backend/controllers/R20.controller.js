const R20 = require("../models/R20.model.js");
const User = require("../models/user.model.js");
const Cache = require("../models/cache.model.js");
const dotenv = require("dotenv");

dotenv.config();

const getAllData = async (req, res) => {

    let { ID, NAME, sort, SCHOOL, PHONE, DOB, GENDER, CASTE, MANDAL, DISTRICT, P1, P2, STREAM, ROOM, BRANCH, numericFilters } = req.query;
    // console.log(ID, NAME, sort);

    console.log(req.query);
    // console.log(ID, NAME, SCHOOL);
    let query = {};

    // const queryKey = JSON.stringify(req.query);
    // const cachedData = await Cache.findOne({ key: queryKey });

    // if (cachedData) {
    //     console.log("Data from Cache");
    //     return res.status(200).json({ data: cachedData.data, length: cachedData.data.length });
    // }

    if (ID)
        query['ID'] = { $regex: ID, $options: 'i', $exists: true };
    if (NAME)
        query['NAME'] = { $regex: NAME, $options: 'i', $exists: true };
    // if(PHONE)
    //     query['PHONE'] = { $regex: PHONE, $options: 'i' };
    if (DOB)
        query['DOB'] = { $regex: DOB, $options: 'i', $exists: true };
    if (GENDER)
        query['GENDER'] = { $regex: GENDER, $options: 'i', $exists: true };
    if (CASTE)
        query['CASTE'] = { $regex: CASTE, $options: 'i', $exists: true };
    if (SCHOOL)
        query['SCHOOL'] = { $regex: SCHOOL, $options: 'i', $exists: true };
    if (MANDAL)
        query['MANDAL'] = { $regex: MANDAL, $options: 'i', $exists: true };
    if (DISTRICT)
        query['DISTRICT'] = { $regex: DISTRICT, $options: 'i', $exists: true };
    if (P1)
        query['P1'] = { $regex: P1, $options: 'i', $exists: true };
    if (P2)
        query['P2'] = { $regex: P2, $options: 'i', $exists: true };
    if (STREAM)
        query['STREAM'] = { $regex: STREAM, $options: 'i', $exists: true };
    if (ROOM)
        query['ROOM'] = { $regex: ROOM, $options: 'i', $exists: true };
    if (BRANCH)
        query['BRANCH'] = { $regex: BRANCH, $options: 'i', $exists: true };


    //NUMERIC GILTERS
    if (numericFilters) {
        const operator = {
            '>': '$gt',
            '>=': '$gte',
            '<': '$lt',
            '<=': '$lte',
            '=': '$eq'
        }

        const regEx = /\b(<|>|>=|=|<|<=)\b/g;
        let filters = numericFilters.replace(regEx, (match) => `#${operator[match]}#`);

        console.log(filters);

        const options = ['ID', 'P1S1', 'P1S2', 'P2S1', 'P2S2', 'E1S1', 'E1S2', 'E2S1', 'E2S2', 'THE_AVG', 'PUC_GPA', 'RANK', 'ENGG_AVG'];
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('#');
            if (field === 'ID') {
                query[field] = { [operator]: value, $exists: true };
            }

            else if (options.includes(field)) {
                query[field] = {...(query[field] || {}), [operator]: Number(value), $exists: true, $ne: null };
            }

        })
    }

    if (query && process.env.HIDE_BRO != req.user.email) {
        console.log("req", req.user);

        let user = await User.findById(req.user.userId);
        let time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

        if (ID)
            if(!user.viewed.includes(ID) && ID.length > 6)
                user.viewed.push(ID + "-" + time);
        if (NAME)
            if(!user.viewed.includes(NAME) && NAME.length > 6)
                user.viewed.push(NAME + "-" + time);

        await user.save();
        console.log(user);

        // if (ID) {
        //     user = User.findOne({ id: ID });
        //     user.viewedBy.push(req.user.email);
        // }
        // await user.save();
        // if(NAME)
        // {

        // }
    }

    console.log("query: ", query);

    let result = R20.find(
        query
    );

    // console.log(result);

    if (sort) {
        const sortFields = sort.split(',');
        const options = sortFields.join(' ');
        // console.log(options);
        // console.log(typeof (options));
        sortFields.forEach(field => {
            if (field.startsWith('-')) {
                field = field.substring(1);
            }
            if (!query[field])
                query[field] = { $exists: true };
            else
                query[field] = { ...query[field], $exists: true };
        });

        console.log(query);
        result = result.sort(options);
        // result = User.find(query).sort(options);
        console.log(`Sorted by ${options}`);
        // console.log(result);
    }
    else {
        result = result.sort('ID');
    }

    //Select
    //select certain fields only

    //Page
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    // result = result.skip(skip).limit(limit);


    let data = await result.exec();
    data = data.map((user, index) => ({
        'num': index + 1,
        ...user._doc
    }));

    // await Cache.create({ key: queryKey, data });
    res.status(200).json({ data, length: data.length });
};

const getSingleData = async (req, res) => {
    console.log(req.params.username);
    res.send(`<h1>${req.params.username}</h1>`);
};

module.exports = { getAllData, getSingleData };
