const mongoose= require('mongoose');

async function connect() {
    await mongoose.connect("mongodb+srv://lakshmi:hRJRGMH2YeOH3tb9@cluster0.u8wkp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("mongodb connected , Welcome");
    
}
module.exports=connect