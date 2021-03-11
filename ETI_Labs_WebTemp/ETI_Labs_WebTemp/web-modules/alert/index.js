var handlebars = require('handlebars'),
fs = require('fs'),
path = require('path');
const {parse} = require('querystring') ;
const url = require('url') ;
 
var db = require('../config/mongoose') ;
var alertNew = require('../models/alert') ;
const { get } = require('http');
const { runInThisContext } = require('vm');

handlebars.registerPartial('Header', fs.readFileSync(path.join(process.cwd(),'templates/partials/_header.handlebars'), 'utf-8'));
handlebars.registerPartial('Footer', fs.readFileSync(path.join(process.cwd(),'templates/partials/_footer.handlebars'), 'utf-8'));

const mainSrc = fs.readFileSync(path.join(__dirname,'templates/main.hbs'),'utf-8');
const mainTemp = handlebars.compile(mainSrc);

 
 function loadData(template,options,newUrl, res) {

    alertNew.find({}, function(err, alert_list){
        if(err){
            console.log('error in fetching the machine data');
            return;
        }

        let facility,machineCode, employeeCode, mobile,email;
        let arr=[];
        let id = [] ;
        let feed = [] ;
        for(let i=0; i<alert_list.length;i++){
            feed=[
                alert_list[i]._id,
                alert_list[i].facility,
                alert_list[i].machineCode,
                alert_list[i].employeeCode,
                alert_list[i].mobile,
                alert_list[i].email
            ]
            arr.push(feed);
            id.push(alert_list[i]._id) ;
            // id.push()
        }

        const data = {
            title: 'ETI Labs Alert Management',
            // header: ["Facility", "Machine Code","Employee Code","Mobile", "Email"],
            fieldData:[['text','facility','facility','Facility'],['number','machineCode','machine-code','Machine Code'],['number','employeeCode','employee-code','Employee Code'], ['number','mobile','mobile','Mobile'], ['email','email','email','Email']],
            pageHeader:'SMS Email Alerts',
            arrayData: arr,
            id: id,
            urlOptions: options,
            newUrl: newUrl,
            page: 'Alert',
            togglePage: 'Machine'
        }
         
        try{
            //var htmlData = template(data);
            return res.end(mainTemp(data)) ;
        }
        catch (err){ 
            console.log(err);
            return;
        }
        
    });
    

}



module.exports = { 

get: function(uri, queryParams, querySearch,urlAll, req, res) {

    
    if(uri == '/alert'){
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/read.hbs'), 'utf-8'));
        const newUrl = [
            {text: "Add Alert", link: "/alert/add"},
            {text: "Manage Machine", link: "/alert"}
        ]
        const options =[
			{text:"edit", link:"/alert/edit/?id="},
			{text:"delete", link:"/alert/delete/?id="}
		]
        loadData(mainTemp,options,newUrl, res);
    }
    if(uri == "/alert/add"){

        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/add.hbs'), 'utf-8'));
        const newUrl = [] ;
        const options =[
            {text: "Submit", link: "/alert"},
            {text: "Cancel", link: "/alert"}
        ]
        loadData(mainTemp,options,newUrl,res);
    }
    
    if(uri == '/alert/edit/') {
        console.log("edit") ;
        console.log(req.url) ;
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/edit.hbs'), 'utf-8'));
        const options =[
            {text: "Update", link: "/alert/edit/?id="},
            {text: "Cancel", link: "/alert"}
        ]
        
        this.fetchData(mainTemp, req, res,options) ;
    }
    
    if(uri == '/alert/delete/') {
        console.log("delete") ;
        console.log(req.url) ;
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/delete.hbs'), 'utf-8'));
        const options =[
            {text: "Delete", link:"/alert/delete/?id="},
            {text: "Cancel", link: "/alert"}
        ]

        this.fetchData(mainTemp, req, res,options) ;
    }
    
    

    
},
post: function(uri, queryParams, req, res) {
    
    if(uri == "/alert"){
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/read.hbs'), 'utf-8'));
        const newUrl = [
            {text: "Add Alert", link: "/alert/add"},
            {text: "Manage Machine", link: "/alert"}
        ]
        const options =[
			{text:"edit", link:"/alert/edit/?id="},
			{text:"delete", link:"/alert/delete/?id="}
		]
        this.insertData(mainTemp,req,res,options, newUrl);
    }
    
    if(uri == "/alert/edit/") {
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/read.hbs'), 'utf-8'));
        const newUrl = [
            {text: "Add Alert", link: "/alert/add"},
            {text: "Manage Machine", link: "/alert"}
        ]
        const options =[
			{text:"edit", link:"/alert/edit/?id="},
			{text:"delete", link:"/alert/delete/?id="}
		]
        this.updateRecord(mainTemp, req, res,options, newUrl) ;
    }

    if(uri == '/alert/delete/') {
        console.log("delete") ;
        console.log(req.url) ;
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/read.hbs'), 'utf-8'));
        const newUrl = [
            {text: "Add Alert", link: "/alert/add"},
            {text: "Manage Machine", link: "/alert"}
        ]
        const options =[
			{text:"edit", link:"/alert/edit/?id="},
			{text:"delete", link:"/alert/delete/?id="}
		]
        this.deleteData(mainTemp, req, res,options, newUrl) ;
       
    }
    

},
put: function(uri, queryParams, req, res) {
    console.log(uri);
    console.log(queryParams);
    return ["Not Allowed", ""];
},
delete: function(uri, queryParams, req, res) {
    console.log(uri);
    console.log(queryParams);
    return ["Not Allowed", ""];
},
insertData: function (template,req, res,options,newUrl) {
    this.collectRequestData(req, result => {
   
        alertNew.create({
            facility: result.facility,
            machineCode: result.machineCode,
            employeeCode: result.employeeCode,
            mobile: result.mobile,
            email: result.email

        }, function(err, newData, ){
            if(err){
                console.log('error in creating new data');
                return;
            }
            
            console.log('******', newData);
            loadData(template,options,newUrl, res);

        });
    });
    
},

collectRequestData: function (request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
},

updateRecord: function(template, req, res,options, newUrl) {

    this.collectRequestData(req, result => {

        console.log(result._id) ;

        
            alertNew.findOneAndUpdate({ _id: result._id }, {
                employeeCode: result.employeeCode,
                mobile: result.mobile,
                email: result.email
            },
            { new: true },
            (err, doc) => {
                if (!err) { loadData(template,options, newUrl, res); }
                else {
                    console.log('Error during record update : ' + err);
                }
        });
        
                
    })

},

deleteData: function(template, req, res,options, newUrl) {
    let idQuery = (req.url).split("?")[1]
            
     let id = idQuery.split("=")[1]
     console.log(id) ;
    
        alertNew.findByIdAndDelete(id, function(err){
            if(err){
                console.log('error in deleting');
                return;
            }
                        
            loadData(mainTemp,options, newUrl, res) ;
                        
        });
    
        
},


fetchData: function(template, req, res,options) {
    console.log("machine/alert data") ;
    
    let idQuery = (req.url).split("?")[1] ;

    let id = idQuery.split("=")[1] ;
 
    alertNew.findById(id, (err, doc) => {
        if (!err) {
            console.log("doc " + doc) ;
            // const arr1 = doc ;
            let buffer = Buffer.from(JSON.stringify(doc));
            // console.log(buffer) ;
            // const newDoc = Object.values(arr1) ;
            // console.log(newDoc) ;
            const newDoc =[];
            newDoc.push(doc._id) ;
            newDoc.push(doc.facility) ;
            newDoc.push(doc.machineCode) ;
            newDoc.push(doc.employeeCode) ;
            newDoc.push(doc.mobile) ;
            newDoc.push(doc.email) ;
            const data5={
                newDoc: newDoc,
                fixedData:[["Facility",doc.facility],["Machine Code",doc.machineCode]],
                header: [ "Employee Code","Mobile","Email"],
                page:'Alert',
                // doc:doc,
                deldata:[["Facility",doc.facility],["Machine Code",doc.machineCode],["Employee Code",doc.employeeCode,],["Mobile",doc.mobile],["Email",doc.email]],
                fieldData:[['number','employeeCode','employee-code',doc.employeeCode,"Employee Code"], ['number','mobile','mobile',doc.mobile,"Mobile"], ['email','email','email',doc.email,"Email"]],
                id:doc._id,
                urlOptions: options,   
            }
            console.log("newdata **" + newDoc) ;
            res.end(mainTemp(data5)) ; 

        }
        else {
            console.log(err) ;
        }
    })
}

};