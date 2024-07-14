require("dotenv").config();

const config=require("./config.json");
const mongoose=require("mongoose");

mongoose.connect(config.connectionString);


const User=require("./models/user.model");

const express = require("express");
const cors=require("cors")
const app=express();

const jwt=require("jsonwebtoken");
const {authenticateToken}=require("./utilities");

app.use(express.json());
app.use(cors({
    origin:"*",
}));

app.get("/",(req,res)=>{
    res.json({data:"hello"});
});

//create account
app.post("/create-account",async(req,res)=>{
    const {fullName, email,password}=req.body;
    if(!fullname){
        return res.status(400).json({error:true,message:"Full Name is required"});
    }
    if(!email){
        return res.status(400).json({error:true, message:"Email is reqired"});
    }
    if(!password){
        return res.status(400).json({error:true,message:"Password is required"});
    }
    const isUser=await User.findOne({email:email});s
    if(isUser){
    return res.json({
        error:true,
        message:"User already exist",
})
    }
    const user=new User({
fullName,
email,
password
    });
    await user.save();
    const accessToken=jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"36000m",});
    return res.json({
        error:false,
        user,
        accessToken,
        message:"registration successful."
    });
});
app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    if(!email){
return res.status(400).json({message:"Email is required."});
    }
    if(!password){
        return res.status(400).json({message:"Password is required."});
    }

    const userInfo=await User.findOne({email:email});
    if(!userInfo){
        return res.status(400).json({message:"User not found."});
    }

    if(userInfo.email==email && userInfo.password==password){
        const user={user:userInfo};
        const accesstoken=jwt.sign(user,proccess.env.ACCESS_TOKEN_SECRET,{
            expiresIN:"36000m",
        });
        return res.json({
            error:false,
            message:"login successful",
            email,
            accessToken,
        });
    }
    else{
        return res.status(400).json({
            error:true,
            message:"Invalid credentials"
        });
    }
});

//get user

app.get("/get-user",authenticateToken,async(req,res)=>{
    const {user}=req.body;
    const isUser=await User.findOne({_id:user._id});
    if(!isUser){
    return res.sendStatus(401);
    }
    return res.json({
        user:{fullName:isUser.fullName,email:isUser.email, _id:isUser._id,createdOn:isUser.createdOn},
        message:"login successful",
    });
});
//add note
app.post("/add-note",authenticateToken,async(req,res)=>{
    const {title,content,tags}=req.body;
    const{user}=req.res;
if(!title){
    return res.status(400).json({error:true, message:"Title is required."});
}
if(!content){
    return res.status(400).json({error:true, message:"Content is required."});
}
try{
    const note=new Note ({
        title,
        content,
        tags:tags || [],
        userId:user._id,        
    });
    await note.save();
    return res.json({
        error:false,
        note,
        message:"Note added successfuly",
    });
}
catch (error){
    return res.status(500).json({
        error:true,
        message:"Internal server Error",
    })
}
});

//edit note
app.put ("/edit-note/:noteId",authenticationToken, async (req,res)=>{
    const noteId=req.params.noteId;
    const{title,content,tags, isPinned}=req.body;
    const {user}=req.user;
    if(!title && !content && !tags){
        return res.status(400).json({error:true,message:"No changes provided"});        
    }
    try{
        const note=await Note.findOne({_id:onemptied,userId:user_.id});
if(title) note.title=title;
if(content) note.content=content;
if(tags) note.tags=tags;
if(isPinned) note.isPinned=isPinned;

await note.save();
return res.json({
    error:false,
    note,
    message:"Note updated successfuly",
});
    }
   catch(error)
   {
    return res.status(500).json({
        error:true,
        message:"Internal Server Error",
    });
   }
});

//get all notes

app.get("/get-all-notes",authenticateToken,async(req,res)=>{
    const {user} =req.user;

    try{
        const notes=await Note.find({userId:user._id}).sort({isPinned:-1});
        return res.json({
            error:false,
            notes,
            message:"All notes retrieved successfuly",
        });
    }
    catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        });
    }
});
app.delete("/delete-note/:noteId",authenticateToken,async(req,res)=>{
const noteId=req.params.noteId;
const {user}=req.user;

try{
    const note=await Note.findOne({_id:noteId, userId:user._id});

    if(!note){
        return res.status(400).json({error:true,message:"Note not found"});
    }
    await Note.deleteOne({_id:noteId,userId:user._id});

    return res.json({
        error:false,
        message:"Note deleted successfuly"
    });
}
catch(error)
{
    return res.status(500).json({
        error:true,
        message:"Internal Server Errror"
    })
}
});

//update isPinned value
app.put("/update-note-pinned/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const{ isPinned}=req.body;
    const {user}=req.user;
   
    try{
        const note=await Note.findOne({_id:onemptied,userId:user_.id});

 note.isPinned=isPinned;

await note.save();
return res.json({
    error:false,
    note,
    message:"Note updated successfuly",
});
    }
   catch(error)
   {
    return res.status(500).json({
        error:true,
        message:"Internal Server Error",
    });
   }
});

app.listen(8000)

module.exports=app;