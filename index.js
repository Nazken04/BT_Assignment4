const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb+srv://Nazken_Azhar:Nazken_Azhar@users.io9oiqy.mongodb.net/");

var db = mongoose.connection;

db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        min: 6,
        required: true,
    },
});

userSchema.pre("save", async function (next) {
    try {
        const user = this;
        if (user.isModified("password")) {
            user.password = await bcrypt.hash(user.password, 10);
        }
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model('Users', userSchema);

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ "email": email }).exec();

        if (user && await bcrypt.compare(password, user.password)) {
            console.log("Login Successful");
            return res.sendFile(__dirname + '/user_profile.html');
        } else {
            res.status(401).send("Invalid login credentials");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.route("/sign_up").post(async (req, res) => {
    const { name, email, phno, password } = req.body;

    try {
        if (password.length < 5) {
            return res.status(400).send("Password must be at least 5 characters long");
        }

        const newUser = new User({ name, email, phno, password });
        await newUser.save();
        console.log("Record Inserted Successfully");
        return res.sendFile(__dirname + '/login.html');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/", (req, res) => {
    return res.sendFile(__dirname + '/index.html');
});
app.get("/login.html", (req, res) => {
    return res.sendFile(__dirname + '/login.html');
});
app.get("/connect_wallet.html", (req, res) => {
    return res.sendFile(__dirname + '/connect_wallet.html');
});
app.get("/Main_page.html", (req, res) => {
    return res.sendFile(__dirname + '/Main_page.html');
});
app.get("/user_profile.html", (req, res) => {
    return res.sendFile(__dirname + '/user_profile.html');
});
app.get("/friends_page.html", (req, res) => {
    return res.sendFile(__dirname + '/friends_page.html');
});

app.listen(8084, () => {
    console.log("Listening on PORT 8084");
});
