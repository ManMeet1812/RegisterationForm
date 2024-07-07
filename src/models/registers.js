const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { response } = require("express");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstName: {
        type : String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true, 
        unique: true
    },
    phone:{
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!/^\+?\d{10,15}$/.test(value)) {  // Regex depends on your requirements
                throw new Error("Invalid phone number format");
            }
        }
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
        required: true
    },
    tokens: [{
        token : {
            type: String,
            required: true
        }
    }]
})

// Generating Tokens
employeeSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        return(token);

    }catch(error){
        res.send("Error", error);
        console.log("Error", error);
    }
}

// Converting Passwords into hash
employeeSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmPassword = await bcrypt.hash(this.password, 10); 
    }
    next();
})

// Now we need to create a collection
const Register = new mongoose.model("Register", employeeSchema);

module.exports= Register;