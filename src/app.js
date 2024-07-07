require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require("path");
const jwt = require("jsonwebtoken");

const express = require('express');
const app = express();

const hbs = require('hbs');
require("./db/conn");
const Register = require("./models/registers");


const port = process.env.PORT || 8000;

const staticPath =path.join(__dirname, '../public' );
const templatePath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(staticPath));
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialsPath);

console.log(process.env.SECTRET_KEY)

app.get("/", (req, res) =>{
   
    res.render("index");
})

app.get("/login", (req, res) =>{
    res.render("login");
})

app.get("/register", (req, res) =>{
    res.render("register");
})

app.post("/register", async(req, res) =>{
    try{    
        const password = req.body.password;
        const cpassword = req.body.confirmPassword;

        if(password === cpassword){
            const registerEmployee = new Register({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword
            })

            console.log("The sucess Part" + registerEmployee);
            const token = await registerEmployee.generateAuthToken();
            console.log("Token: " + token);

            const registered = await registerEmployee.save();
            console.log(registered);
            res.status(201).render("index");
        }else{
            res.send("Password Not Matching");
        }
    }catch(error){
        res.status(400).send(error);
    }
    
})

// login check
app.post("/login", async(req, res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        

        const useremail = await Register.findOne({email:email});

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("The Token is " + token);
        
        if(isMatch){
            res.status(201).render("index")
        }else{
            res.send("Invalid Login Details"); 
        }   

    }catch(error){
        res.status(400).send("Invalid Login Details");  
    }
})

app.listen(port, () =>{
    console.log(`Server is running at port no ${port}`);
})
