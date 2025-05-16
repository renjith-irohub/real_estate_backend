const mongoose= require('mongoose');

async function connect() {
    await mongoose.connect(process.env.MongoURI);
    console.log("mongodb connected , Welcome");
    
}
module.exports=connect