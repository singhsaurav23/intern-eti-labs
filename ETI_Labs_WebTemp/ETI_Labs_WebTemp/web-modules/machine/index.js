var handlebars = require('handlebars'),
fs = require('fs'),
path = require('path');
const {parse} = require('querystring') ;
const url = require('url') ;
 
var db = require('../config/mongoose') ;
var machineNew = require('../models/table-content') ;
const { get } = require('http');
const { runInThisContext } = require('vm');

handlebars.registerPartial('Header', fs.readFileSync(path.join(process.cwd(),'templates/partials/_header.handlebars'), 'utf-8'));
handlebars.registerPartial('Footer', fs.readFileSync(path.join(process.cwd(),'templates/partials/_footer.handlebars'), 'utf-8'));

const mainSrc = fs.readFileSync(path.join(__dirname,'templates/main.hbs'),'utf-8');
const mainTemp = handlebars.compile(mainSrc);

 
 function loadData(template,options,newUrl, res) {

        machineNew.find({}, function(err, machine_list){
            if(err){
                console.log('error in fetching the machine data');
                return;
            }
            
            let facility,machineCode, machineName, hydraulicMotor,coolant,lubricationMotors;
            let arr=[];
            let id = [] ;
            let feed =[] ;
            
            for(let i=0; i<machine_list.length;i++){
                feed=[
                    machine_list[i]._id,
                    machine_list[i].facility,
                    machine_list[i].machineCode,
                    machine_list[i].machineName,
                    machine_list[i].hydraulicMotors,
                    machine_list[i].coolant,
                    machine_list[i].lubricationMotors

                ]
                arr.push(feed);
                id.push(machine_list[i]._id) ;
            }

            console.log("feed" + feed) ;
            console.log("array", arr) ;
          
            const data = {
                title: 'ETI Labs Products and Services',
                // header: ["Facility", "Machine Code", "Machine Name","No. of Hydraulic Motor", "No. of Coolant","No. of Lubrication Motor"],
                fieldData:[['text','facility','facility','Facility'],['number','machineCode','machine-code','Machine Code'],['text','machineName','machine-name','Machine Name'], ['number','hydraulicMotors','hydraulic-motor','No. of Hydraulic Motor'], ['number','coolant','coolant','No. of Coolant'],[ 'number','lubricationMotors','lubrication','No. of Lubrication Motor']],
                pageHeader:'Product List',
                arrayData: arr,
                urlOptions: options,
                newUrl: newUrl,
                id: id,
                page: 'Machine',
                togglePage: 'Alert'
            }

           
            
            try{
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

    
    if(uri == '/machine'){
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/read.hbs'), 'utf-8'));
        // const options ={
        //     add: "/machine/add",
        //     togglePage:"/alert",
        //     edit:"/machine/edit/?id=",
        //     delete:"/machine/delete/?id="
        // }
        const newUrl = [
            {text: "Add Machine", link: "/machine/add"},
            {text: "Manage Alert", link: "/alert"}
        ]
        const options =[
			{text:"edit", link:"/machine/edit/?id="},
			{text:"delete", link:"/machine/delete/?id="}
		]
        loadData(mainTemp,options,newUrl, res);
    }
    if(uri == "/machine/add"){

        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/add.hbs'), 'utf-8'));
        const newUrl = [] ;
        const options =[
            {text: "Submit", link: "/machine"},
            {text: "Cancel", link: "/machine"}
        ]
        loadData(mainTemp,options,newUrl,res);
    }
    
    if(uri == '/machine/edit/') {
        console.log("edit") ;
        console.log(req.url) ;
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/edit.hbs'), 'utf-8'));
        const options =[
            {text: "Update", link: "/machine/edit/?id="},
            {text: "Cancel", link: "/machine"}
        ]
        
        this.fetchData(mainTemp, req, res,options) ;
    }
    
    if(uri == '/machine/delete/') {
        console.log("delete") ;
        console.log(req.url) ;
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/delete.hbs'), 'utf-8'));
        const options =[
            {text: "Delete", link:"/machine/delete/?id="},
            {text: "Cancel", link: "/machine"}
        ]

        this.fetchData(mainTemp, req, res,options) ;
    }
    
    
},
post: function(uri, queryParams, req, res) {
    
    if(uri == "/machine"){
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/read.hbs'), 'utf-8'));
        const newUrl = [
            {text: "Add Machine", link: "/machine/add"},
            {text: "Manage Alert", link: "/alert"}
        ]
        const options =[
			{text:"edit", link:"/machine/edit/?id="},
			{text:"delete", link:"/machine/delete/?id="}
		]
        this.insertData(mainTemp,req,res,options, newUrl);
    }
    
    if(uri == "/machine/edit/") {
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/read.hbs'), 'utf-8'));
        const newUrl = [
            {text: "Add Machine", link: "/machine/add"},
            {text: "Manage Alert", link: "/alert"}
        ]
        const options =[
			{text:"edit", link:"/machine/edit/?id="},
			{text:"delete", link:"/machine/delete/?id="}
		]
        this.updateRecord(mainTemp, req, res,options, newUrl) ;
    }

    if(uri == '/machine/delete/') {
        console.log("delete") ;
        console.log(req.url) ;
        handlebars.registerPartial('body', fs.readFileSync(path.join(process.cwd(),'templates/read.hbs'), 'utf-8'));
        const newUrl = [
            {text: "Add Machine", link: "/machine/add"},
            {text: "Manage Alert", link: "/alert"}
        ]
        const options =[
			{text:"edit", link:"/machine/edit/?id="},
			{text:"delete", link:"/machine/delete/?id="}
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
insertData: function (template,req, res,options, newUrl) {
    this.collectRequestData(req, result => {
   
        machineNew.create({
            facility: result.facility,
            machineCode: result.machineCode,
            machineName: result.machineName,
            hydraulicMotors: result.hydraulicMotors,
            coolant: result.coolant,
            lubricationMotors: result.lubricationMotors

        }, function(err, newData, ){
            if(err){
                console.log('error in creating new data', err);
                return;
            }
            
            console.log('******', newData);

            
            loadData(mainTemp,options, newUrl, res);
            
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

updateRecord: function(template, req, res,options,newUrl) {

    this.collectRequestData(req, result => {

        console.log(result._id) ;

        
                machineNew.findOneAndUpdate({ _id: result._id }, {
                    machineName: result.machineName,
                    hydraulicMotors: result.hydraulicMotors,
                    coolant: result.coolant,
                    lubricationMotors: result.lubricationMotors
                },
                { new: true },
                (err, doc) => {
                    if (!err) { loadData(mainTemp,options,newUrl, res); }
                    else {
                        console.log('Error during record update : ' + err);
                    }
            });
        
                
    })

},

deleteData: function(template, req, res,options,newUrl) {
    let idQuery = (req.url).split("?")[1]
            
     let id = idQuery.split("=")[1]
     console.log(id) ;
    
        machineNew.findByIdAndDelete(id, function(err){
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
 
        
        machineNew.findById(id, (err, doc) => {
            if (!err) {
                console.log("doc " + doc) ;
                
                let buffer = Buffer.from(JSON.stringify(doc));
    
                const newDoc =[];
                newDoc.push(doc._id) ;
                newDoc.push(doc.facility) ;
                newDoc.push(doc.machineCode) ;
                newDoc.push(doc.machineName) ;
                newDoc.push(doc.hydraulicMotors) ;
                newDoc.push(doc.coolant) ;
                newDoc.push(doc.lubricationMotors) ;
                console.log("newdata **" + newDoc) ;
                const data4={
                    newDoc: newDoc,
                    header: [ "Machine Name","No. of Hydraulic Motor", "No. of Coolant","No. of Lubrication Motor"],
                    fixedData:[["Facility",doc.facility],["Machine Code",doc.machineCode]],
                    // doc:doc,
                    page:'Machine',
                    urlOptions: options,
                    deldata:[["Facility",doc.facility],["Machine Code",doc.machineCode],["Machine Name",doc.machineName],["No. of Hydraulic Motor",doc.hydraulicMotors],["No. of Coolant",doc.coolant],["No. of Lubrication Motor",doc.lubricationMotors]],
                    fieldData:[['text','machineName','machine-name',doc.machineName,"Machine Name"], ['number','hydraulicMotors','hydraulic-motor',doc.hydraulicMotors,"No. of Hydraulic Motor"], ['number','coolant','coolant',doc.coolant,"No. of Coolant"],[ 'number','lubricationMotors','lubrication',doc.lubricationMotors,"No. of Lubrication Motor"]],
                    id:doc._id
                    
                    
                }
                res.end(mainTemp(data4)) ; 
    
            }
            else {
                console.log(err) ;
            }
    });
}

};