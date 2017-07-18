var express = require('express');
var bodyParser = require('body-parser');
var Cloudant = require('cloudant');
var cors = require('cors');
var nodemailer = require('nodemailer');
var smtp = require('nodemailer-smtp-transport');
var me = 'ramachandrar143';
var password = 'Dqcrg.123';
var cloudant = Cloudant({account:me, password:password});
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use(express.static(__dirname+'/public'));
app.get('/ExamSchedules',function(req,res){
	res.sendFile(__dirname+'/public/'+'admin.html');
})
app.post('/insert',function(req,res){
    var ExamType = req.body.ExamType;
    var  data = req.body;
          console.log(data);
console.log(data.Dept);
     var db = cloudant.db.use(data.Dept);
    db.insert({_id:ExamType,data},function(err,data){
			if(err){
				
				var error = err.name;
				if(error == "Error")
				{
					var resp = {
					"result":"error"
				}
				res.json(resp)
				}
				else{
				var resp = {
					"result":"err"
				}
				res.json(resp)
				}
			}
			else{
				var resp = {
					"result":"success"
				}
				res.json(resp);
			}
	 });	 
 });
 app.get('/signUp', function (req, res) {
    res.sendFile(__dirname + '/public/untit.html');
});
app.post('/data', function (req, res) {
	console.log("Dataa");
	var name = req.body.firstname + req.body.lname;
    var data = req.body;
	var email = req.body.email;
	console.log(email);
	var db = cloudant.db.use('admin');
	db.insert({_id:name,data},function(err,data){
			if(err){
				
				var error = err.name;
				if(error == "Error")
				{
					var resp = {
					"result":"error"
				}
				res.json(resp)
				}
				else{
				var resp = {
					"result":"err"
				}
				res.json(resp)
				}
			}
			else{
				console.log(res);
				var transport = nodemailer.createTransport(smtp( {
				service: 'hotmail',
				auth: {
				user: "ramachandrar143@hotmail.com",
				pass: "Dqcrg.123"
					}
				}));
			var message = {
				from: 'ramachandrar143@hotmail.com',
				to: email,
				subject: 'Joining Order', 
				text: 'Dear' + req.body.firstname+ ' '+req.body.lname+'\n Thanks for choosing Miracle. Your Application was recieved and we\'ll get back to you soon'
			};
				transport.sendMail(message, function(error){
			if(error){
			console.log('Error occured');
			console.log(error.message);
			return;
			}
			console.log('Message sent successfully!');
			});
				var resp = {
					"result":"success"
				}
				res.json(resp);
			}
	})
})
 app.listen(process.env.PORT||3000);
 console.log("Listening at 3000");