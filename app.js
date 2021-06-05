const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const ejs = require("ejs");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
    url
} = require("inspector");
require('dotenv/config');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const nodemailer = require('nodemailer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({
    storage: storage
});

const app = express();
var sessionlogged = 0;
var asessionlogged = 0;

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(session({
    secret: "swap123",
    saveUninitialized: true,
    resave: true
}));

mongoose.connect("mongodb://localhost:27017/swapDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // TODO: your gmail account
        pass: process.env.PASSWORD // TODO: your gmail password
    },
    tls: {
        rejectUnauthorized: false
    }
});

const accountSchema = new mongoose.Schema({
    accname: String,
    accemail: String,
    accphno: String,
    accwhno: String,
    accclgname: String,
    accdept: String,
    accbatch: String,
    accpwd: String,
    tarray: [{
        tname: String,
        tdate: String,
        tdomain: String,
        tdeadline: String,
        ttime: String,
        tlink: String,
        tduration: String,
        tprice: String,
    }],
    warray: [{
            wname: String,
            wdate: String,
            wdomain: String,
            wdeadline: String,
            wtime: String,
            wlink: String,
            wduration: String,
            wprice: String,
    }
    ]
});

const trainingSchema = new mongoose.Schema({
    tname: String,
    tdomain: String,
    tdeadline: String,
    tdate: String,
    ttime: String,
    tlink: String,
    tduration: String,
    tprice: String,
    timage: {
        contentType: String,
        path: String,
        image: Buffer
    }
});

const webinarSchema = new mongoose.Schema({
    wname: String,
    wdomain: String,
    wdeadline: String,
    wdate: String,
    wtime: String,
    wlink: String,
    wprice: String,
    wimage: {
        contentType: String,
        path: String,
        image: Buffer
    }
});

const permanenttrainingSchema = new mongoose.Schema({
    tname: String,
    tdomain: String,
    tdeadline: String,
    tdate: String,
    ttime: String,
    tlink: String,
    tduration: String,
    tprice: String,
});

const permanentwebinarSchema = new mongoose.Schema({
    wname: String,
    wdomain: String,
    wdeadline: String,
    wdate: String,
    wtime: String,
    wlink: String,
    wprice: String,
});

const joinusSchema = new mongoose.Schema({
    name: String,
    email: String,
    domain: String,
    phno: String,
    resumelink: String
});


const Account = new mongoose.model("Account", accountSchema);
const Webinar = new mongoose.model("Webinar", webinarSchema);
const Training = new mongoose.model("Training", trainingSchema);
const Permanenttraining = new mongoose.model("Permanenttraining", permanenttrainingSchema);
const Permanentwebinar = new mongoose.model("Permanentwebinar", permanentwebinarSchema);
const Joinus = new mongoose.model("Joinus", joinusSchema);

//GET METHODS

app.get("/", function (req, res) {
    res.render("index", {
        sessionlogged: sessionlogged
    });
});

app.get('/dindex', (req, res) => {
    if (asessionlogged == 1) {
        Training.find({}, (err, trainingitems) => {
            Webinar.find({}, (err, webinaritems) => {
                Permanenttraining.find({}, (err, permanenttrainingitems) => {
                    Permanentwebinar.find({}, (err, permanentwebinaritems) => {
                        Joinus.find({}, (err, careeritems) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send('An error occurred', err);
                            } else {
                                res.render('dindex', {
                                    training: trainingitems,
                                    webinar: webinaritems,
                                    permanenttraining: permanenttrainingitems,
                                    permanentwebinar: permanentwebinaritems,
                                    asessionlogged: asessionlogged,
                                    careeritems: careeritems
                                });
                            }
                        });
                    });
                });
            });
        });
    } else {
        res.status(404).send("<h1>Page Not Found...</h1>");
    }
});

app.get("/dlogin", function (req, res) {
    var alert = 0;
    res.render("dlogin", {
        alertbox: alert
    });
});

app.get("/accsignup", function (req, res) {
    var alert = 0;
    res.render("signup", {
        alertbox: alert
    });

});

app.get("/acclogin", function (req, res) {
    var alert = 0;
    res.render("login", {
        alertbox: alert
    });
});

app.get("/signup", function (req, res) {
    var alert = 0;
    res.render("signup", {
        alertbox: alert
    });

});

app.get("/login", function (req, res) {

    var alert = 0;
    res.render("login", {
        alertbox: alert
    });

});

app.get("/dwebinar", function (req, res) {
    if (asessionlogged == 1) {
        res.render("dwebinar");
    } else {
        res.status(404).send("<h1>Page Not Found...</h1>");
    }
});


app.get('/dtraining', (req, res) => {
    if (asessionlogged == 1) {
        res.render("dtraining");
    } else {
        res.status(404).send("<h1>Page Not Found...</h1>");
    }
});


app.get('/training', (req, res) => {
    Training.find({}, (err, items) => {

        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            res.render('training', {
                items: items,
                sessionlogged: sessionlogged,
                alertbox: 0
            });
        }
    })
});


app.get('/webinar', (req, res) => {
    Webinar.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            res.render('webinar', {
                items: items,
                sessionlogged: sessionlogged,
                alertbox: 0
            });
        }
    });
});

app.get("/team", function (req, res) {
    res.render("team", {
        sessionlogged: sessionlogged
    });
})

app.get("/joinUs", function (req, res) {
    var alert = 0;
    if (sessionlogged == 0) {
        res.redirect("login");
    } else {
        res.render("joinus", {
            alertbox: alert,
            sessionlogged: sessionlogged
        });
    }
})



app.get("/contact", function (req, res) {
    res.render("contact", {
        sessionlogged: sessionlogged
    });
})

app.get("/yourtraining", function (req, res) {
    var array;
    Account.findOne({
        accemail: req.session.user
    }, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            array = user.tarray;
            array.reverse();
            res.render("yourtraining", {
                sessionlogged: sessionlogged,
                array: array
            });
        }
    });
});

app.get("/yourwebinar", function (req, res) {
    var array;
    Account.findOne({
        accemail: req.session.user
    }, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            array = user.warray;
            array.reverse();
            console.log(array);
            res.render("yourwebinar", {
                sessionlogged: sessionlogged,
                array: array
            });
        }
    });
});

app.get("/traininginfo", function (req, res) {
    if (asessionlogged == 0) {
        res.status(404).send("<h1>Page Not Found...</h1>");
    } else {
        var array = []
        var name = "";
        var date = "";
        res.render("traininginfo", {
            array: array,
            i: 1,
            tname: name,
            tdate: date
        });
    }
});

app.get("/webinarinfo", function (req, res) {
    if (asessionlogged == 0) {
        res.status(404).send("<h1>Page Not Found...</h1>");
    } else {
        var array = []
        var name = "";
        var date = "";
        res.render("webinarinfo", {
            array: array,
            i: 1,
            wname: name,
            wdate: date
        });
    }
});


// POST METHODS

app.post("/accdetails", function (req, res) {

    Account.findOne({
        accemail: req.body.email
    }, function (err, foundAccount) {
        if (foundAccount == null) {

            //bcrypt.hash(req.body.rpassword, saltRounds, function (err, hash) {
            const newAccount = new Account({
                accname: req.body.name,
                accemail: req.body.email,
                accphno: req.body.phone,
                accwhno: req.body.wphone,
                accclgname: req.body.clgname,
                accdept: req.body.deptname,
                accbatch: req.body.batch,
                accpwd: req.body.password,
                accwebinarcount: 0,
                acctrainingcount: 0
            });
            newAccount.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("User Created");
                    res.redirect("login");
                }
            });
        } else {
            var alert = 1;
            res.render("signup", {
                alertbox: alert
            });
        }
    });
});

app.post("/checkaccount", function (req, res) {
    var username = req.body.email;
    var password = req.body.password;

    Account.findOne({
        accemail: username,
        accpwd: password
    }, function (err, user) {
        if (err) {
            console.log(err);
        } else if (!user) {
            var alert = 1;
            res.render("login", {
                alertbox: alert
            });
        } else {
            req.session.user = username;
            req.session.save();
            sessionlogged = 1;
            console.log("User Logged in");
            res.redirect("/");
        }
    });
});

app.post("/alogin", function (req, res) {
    var username = req.body.aname;
    var password = req.body.apwd;

    if (process.env.ausername == username && process.env.apassword == password) {
        console.log(true);
        req.session.user = username;
        req.session.save();
        asessionlogged = 1;
        res.redirect("dindex");


    } else {
        var alert = 1;
        console.log(false);
        res.render("dlogin", {
            alertbox: alert
        });

    }
});

app.post('/tevent', upload.single('training'), (req, res, next) => {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');

    const newtraining = new Training({
        tname: req.body.name,
        tdomain: req.body.domain,
        tdeadline: req.body.deadline,
        tdate: req.body.date,
        ttime: req.body.time,
        tlink: req.body.link,
        tduration: req.body.duration,
        tprice: req.body.price,
        timage: {
            contentType: req.file.mimetype,
            path: req.file.path,
            image: new Buffer(encode_image, 'base64')
        }
    });

    Training.create(newtraining, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            item.save();
        }
    });

    const permanenttraining = new Permanenttraining({
        tname: req.body.name,
        tdomain: req.body.domain,
        tdeadline: req.body.deadline,
        tdate: req.body.date,
        ttime: req.body.time,
        tlink: req.body.link,
        tduration: req.body.duration,
        tprice: req.body.price,
    });

    Permanenttraining.create(permanenttraining, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            item.save();
            res.redirect('dindex');
        }
    });
});

app.post('/wevent', upload.single('webinar'), (req, res, next) => {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');

    const newwebinar = new Webinar({
        wname: req.body.name,
        wdomain: req.body.domain,
        wdeadline: req.body.deadline,
        wdate: req.body.date,
        wtime: req.body.time,
        wlink: req.body.link,
        wprice: req.body.price,
        wimage: {
            contentType: req.file.mimetype,
            path: req.file.path,
            image: new Buffer(encode_image, 'base64'),
        }
    });
    Webinar.create(newwebinar, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            item.save();

        }
    });

    const permanentwebinar = new Permanentwebinar({
        wname: req.body.name,
        wdomain: req.body.domain,
        wdeadline: req.body.deadline,
        wdate: req.body.date,
        wtime: req.body.time,
        wlink: req.body.link,
        wprice: req.body.price,
    });
    Permanentwebinar.create(permanentwebinar, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            item.save();
            res.redirect('dindex');
        }
    });
});

app.post("/tremove", function (req, res) {
    var id = req.body.remove;
    Training.deleteOne({
        _id: id
    }, function (err, deleteTraining) {
        if (!err) {
            console.log("success")
            res.redirect("dindex");
        } else {
            console.log(err);
        }
    })
});

app.post("/wremove", function (req, res) {
    var id = req.body.remove;
    Webinar.deleteOne({
        _id: id
    }, function (err, deleteWebinar) {
        if (!err) {
            console.log("success")
            res.redirect("dindex");
        } else {
            console.log(err);
        }
    })
});

app.post("/logout", function (req, res) {
    sessionlogged = 0;
    tregistered = 0;
    req.session.destroy();
    console.log("User logged out!");
    res.redirect("/");
})

app.post("/alogout", function (req, res) {
    asessionlogged = 0;
    req.session.destroy();
    console.log("User logged out!");
    res.redirect("dlogin");
})

app.post("/tregister", function (req, res) {
    var titems;
    var tname = req.body.tname;
    var tdate = req.body.tdate;
    var tdomain = req.body.tdomain;
    var tdeadline = req.body.tdeadline;
    var ttime = req.body.ttime;
    var tlink = req.body.tlink;
    var tduration = req.body.tduration;
    var tprice = req.body.tprice;
    Training.find({}, (err, items) => {

        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            titems = items;
        }
    })
    if (sessionlogged == 0) {
        res.redirect("login");
    } else {
        var tname = req.body.tname;

        Account.findOne({
            accemail: req.session.user
        }, function (err, user) {

            if (err) {
                console.log(err);
            } else {

                if ((user.tarray.length > 0) && (user.tarray.find(element => element.tname == tname && element.tdate == tdate))) {
                    console.log("User registered already " + tname);
                    res.render('training', {
                        items: titems,
                        sessionlogged: sessionlogged,
                        alertbox: 1
                    });
                } else {
                    var t = {
                        tname: tname,
                        tdate: tdate,
                        tdomain: tdomain,
                        tdeadline: tdeadline,
                        ttime: ttime,
                        tlink: tlink,
                        tduration: tduration,
                        tprice: tprice
                    };
                    user.tarray.push(t);
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("updated");
                        }
                    });
                    var mailOption4 = {
                        from: process.env.EMAIL, // TODO: email sender
                        to: req.session.user, // TODO: email receiver
                        subject: 'Swap Inc',
                        html: "<p>Thank you for registering " + `${tname}` + " training. </p><p>Your training starts on " + `${tdate}` + " at " + `${ttime}` + "</p><p>Training Room: " + `${tlink}` + "</p>"


                    };

                    transporter.sendMail(mailOption4, (err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent!!!');
                        }
                    });
                    res.render('training', {
                        items: titems,
                        sessionlogged: sessionlogged,
                        alertbox: 2
                    });
                }
            }
        });
    }
});

app.post("/wregister", function (req, res) {
    var witems;
    var wname = req.body.wname;
    var wdate = req.body.wdate;
    var wdomain = req.body.wdomain;
    var wdeadline = req.body.wdeadline;
    var wtime = req.body.wtime;
    var wlink = req.body.wlink;
    var wprice = req.body.wprice;
    Webinar.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            witems = items;
        }
    })
    if (sessionlogged == 0) {
        res.redirect("login");
    } else {

        Account.findOne({
            accemail: req.session.user
        }, function (err, user) {
            if (err) {
                console.log(err);
            } else {
                if ((user.warray.length > 0) && (user.warray.find(element => element.wname == wname && element.wdate == wdate))) {
                    console.log("User registered already " + wname);
                    res.render('webinar', {
                        items: witems,
                        sessionlogged: sessionlogged,
                        alertbox: 1
                    });
                } else {
                    var w = {
                        wname: wname,
                        wdate: wdate,
                        wdomain: wdomain,
                        wdeadline: wdeadline,
                        wtime: wtime,
                        wlink: wlink,
                        wprice: wprice
                    };
                    user.warray.push(w);
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("updated");
                        }
                    });
                    var mailOption5 = {
                        from: process.env.EMAIL, // TODO: email sender
                        to: req.session.user, // TODO: email receiver
                        subject: 'Swap Inc',
                        html: "<p>Thank you for registering " + `${wname}` + " Webinar.</p><p>Your Webinar will be on " + `${wdate}` + " at " + `${wtime}` + "</p><p>Webinar Room: " + `${wlink}` + "</p>"
                    };

                    transporter.sendMail(mailOption5, (err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent!!!');
                        }
                    });
                    res.render('webinar', {
                        items: witems,
                        sessionlogged: sessionlogged,
                        alertbox: 2
                    });
                }
            }
        });
    }
});

app.post("/joinus", function (req, res) {
    if (sessionlogged == 0) {
        res.redirect("login");
    } else {
        Joinus.findOne({
            email: req.body.email,
            domain: req.body.dept
        }, function (err, foundAccount) {
            if (!foundAccount) {
                const newJoinus = new Joinus({
                    name: req.body.name,
                    email: req.body.email,
                    domain: req.body.dept,
                    phno: req.body.phone,
                    resumelink: req.body.resume
                });
                newJoinus.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        let mailOption1 = {
                            from: process.env.EMAIL, // TODO: email sender
                            to: req.session.user, // TODO: email receiver
                            subject: 'Swap Inc',
                            text: 'Thank you for your interest in joining in Swap Inc. We will get back to you soon...'
                        };

                        transporter.sendMail(mailOption1, (err, data) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Email sent!!!');
                            }
                        });
                        res.redirect("/");
                    }
                });


            } else {
                var alert = 1;
                res.render("joinus", {
                    sessionlogged: sessionlogged,
                    alertbox: alert
                });
            }
        });
    }

});

app.post("/contactus", function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var message = req.body.message;

    var mailOption2 = {
        from: process.env.EMAIL, // TODO: email sender
        to: email, // TODO: email receiver
        subject: 'Swap Inc',
        text: 'Thank you for contacting us, We will solve your query as soon as possible'
    };

    transporter.sendMail(mailOption2, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent!!!');
        }
    });

    var mailoption3 = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: "Query from a user",
        text: message
    };

    transporter.sendMail(mailoption3, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Admin Email sent!!!');
        }
    });
    res.redirect("/");

})

app.post("/traininginfos", function (req, res) {
    if (asessionlogged == 0) {
        res.status(404).send("<h1>Page Not Found...</h1>");
    } else {
        var array = [];
        var name = req.body.tname;
        var date = req.body.tdate;
        console.log(name);
        console.log(date);
        Account.find({}, function (err, user) {
            if (err) {
                console.log(err);
            } else {
                user.forEach(function (user) {
                    if ((user.tarray.length > 0) && (user.tarray.find(element => element.tname == name && element.tdate == date))) {
                        array.push(user);
                        console.log(array);
                        console.log(user);
                    }

                });
            }
            res.render("traininginfo", {
                array: array,
                i: 1,
                tname: name,
                tdate: date
            });
        });


    }
});

app.post("/webinarinfos", function (req, res) {
    if (asessionlogged == 0) {
        res.status(404).send("<h1>Page Not Found...</h1>");
    } else {
        var array = [];
        var name = req.body.wname;
        var date = req.body.wdate;
        Account.find({}, function (err, user) {
            if (err) {
                console.log(err);
            } else {
                user.forEach(function (user) {
                    if ((user.warray.length > 0) && (user.warray.find(element => element.wname == name && element.wdate == date))) {
                        array.push(user);
                    }

                });
            }
            res.render("webinarinfo", {
                array: array,
                i: 1,
                wname: name,
                wdate: date
            });
        });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(3000, function () {
    console.log("Server started on port 3000");
});