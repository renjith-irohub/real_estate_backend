const { stack } = require("../routes");

const errorhandler=((err,req,res,next)=>{
    console.log();
    res.status(err.status || 500).json({message: err.message,stack: err.stack,status: err.status || 500});
      

})
module.exports=errorhandler