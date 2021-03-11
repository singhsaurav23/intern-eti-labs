
var handlebars = require('handlebars'),
	fs = require('fs'),
	path = require('path');

module.exports = {
   get: function(uri, queryParams) {
	   console.log(uri);
	   console.log(queryParams); 
	//    console.log(queryParams.a); 
		var data = {
			title: 'ETI Labs Products and Services',
			productsHeading: 'List of Products',
			servicesHeading: 'List of Services',
			productsList: ['Embedded Development Board', 'IoT Board'],
			servicesList: ['Industrial IoT', 'PCB Designing', 'Training & Workshops', 'Cosultancy']
		}
		try{
			handlebars.registerPartial('products', fs.readFileSync(path.join(__dirname,'templates/partials/products.html.hbs'), 'utf-8'));
			handlebars.registerPartial('services', fs.readFileSync(path.join(process.cwd(),'templates/partials/services.html.hbs'), 'utf-8'));
			source = fs.readFileSync(path.join(__dirname,'templates/list.html.hbs'), 'utf-8');
			var template = handlebars.compile(source);
			var htmlData = template(data);
			return ['OK', htmlData];
		}
		catch (err){ 
			console.log(err);
			return ["Not Found", ""];
		}
   },
   post: function(uri, queryParams) {
		console.log(uri);
		console.log(queryParams);
		return ["Not Allowed", ""];
   },
   put: function(uri, queryParams) {
		console.log(uri);
		console.log(queryParams);
		return ["Not Allowed", ""];
   },
   delete: function(uri, queryParams) {
		console.log(uri);
		console.log(queryParams);
		return ["Not Allowed", ""];
   }
};