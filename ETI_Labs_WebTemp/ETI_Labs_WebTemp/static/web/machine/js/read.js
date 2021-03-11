const handlebars = require(['handlebars']) ;

console.log("hello") ;
handlebars.registerHelper("displayData", function(feed){
    
    console.log(feed) ;
})