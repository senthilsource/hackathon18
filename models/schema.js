var {mongoose} = require("../db/mongoose");


var faceIdentityModel = mongoose.model('FaceID', {
    faceId:{
        type: String,
        required : true,       
        trim : true
    },
    galleryName:{
        type: String,           
        trim : true
    },
    age:{
        type:Number
    },
    gender:{       
        type: String,           
        trim : true
    },
    completedAt:{
      type: Number
    }
  });
  
  module.exports = {faceIdentityModel};
  