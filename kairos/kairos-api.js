var Kairos = require('kairos-api');
var client = new Kairos('3924c2a9', 'a9c4deb930cd0d7e8e98c06eabe123f9');
var request = require("request");
 
var params = {    
  gallery_name:"Hackathon-Test"
};

var enroll =async (reqData) =>{
    var enrollParams = {          
        gallery_name:params.gallery_name,    
        image :reqData.imageSrc,
        subject_id:reqData.subjectId
    };  
    return new Promise((resolve, reject)=>{
        client.enroll(enrollParams).then(function(result){          
            if(result.status==200 && result.body.Errors==undefined){
                 resolve(result);
            }else{                
                reject(result.body.Errors);
            }
        }).catch(function(err){
            reject(err);
        });
    });
   
}

var recognize = (reqData) =>{
    var recognizeParams = {
        gallery_name:params.gallery_name,    
        image :reqData.imageSrc,
    };   
    return new Promise((resolve, reject)=>{
    client.recognize(recognizeParams).then((result)=>{
        if(result.status==200 && result.body.Errors==undefined){
            resolve(result);
       }else{                
           reject(result.body.Errors);
       }      
    }).catch((err)=>{
        reject(err);
    });
});

}

var enrollMedia = (reqData) =>{
    var options = {               
        headers:{
            app_id:'3924c2a9', app_key:'a9c4deb930cd0d7e8e98c06eabe123f9'
        } ,
        source:reqData.imageSrc
    };

    var postRequest = request.post('https://api.kairos.com/v2/media?source=', options, (err, res, body)=>{
        //console.log(JSON.stringify(res.body, null, 2));
    });  
    // var form = postRequest.form();
    // form.append("source", reqData.imageSrc);    
   // form.append("app_key", 'a9c4deb930cd0d7e8e98c06eabe123f9');
   

//     return new Promise((resolve, reject)=>{
//     client.enrollMedia(options).then((result)=>{
//         console.log(JSON.stringify(result.body, null, 2));
//         resolve(result);
//     }).catch((err)=>{
//         reject(err);
//     });
// });
}

var mediaAnalytics = (reqData) =>{
    var params = {
        id:reqData.id
    };
    return new Promise((resolve, reject)=>{
    client.recognize(recognizeParams).then((result)=>{
        console.log(JSON.stringify(result.body, null, 2));
        resolve(result);
    }).catch((err)=>{
        reject(err);
    });
});

}

module.exports = {enroll, recognize, enrollMedia}