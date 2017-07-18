/**
*
*Importing Required Modules
*/
require('dotenv').config();
var twilio = require('twilio');
var cors = require('cors');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var Cloudant = require('cloudant');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(cors());
/**
 * Global Varibles
 */
var flag = 0;
var db;
var ExamType,RegdNum;
/**
*
*Application Credentials
*/
var twilioSid = process.env.TWILIO_SID;
var twilioToken = process.env.TWILIO_TOKEN;
var me = process.env.CLOUDANT_USER;
var password = process.env.CLOUDANT_PASS;
var cloudant = Cloudant({account:me, password:password});
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
var port = (process.env.VCAP_APP_PORT || 3001);
var contextw={}; // Context variable
 //Static files
 app.use(express.static(__dirname+'/public'));
 //Serving HTML file to send Message to Watson
 app.get('/',function(req,res){
 res.sendFile(__dirname+'/index.html');
});
// '/message' API call for all Watson Conversation and Twilio SMS Through HTML
  app.post('/message', function(req, res) {  
		var data = req.body;
		console.log(data);
		var Num = req.body.From;
		var Msg = req.body.Body;
		var client = twilio(twilioSid,twilioToken);
			sendToWatson(contextw, Msg, function(response) {
			console.log("Twilio got :" + response.output.text[0]);
	     client.messages.create({
		to:Num,
		from:'+13123456222',
		body: response.output.text[0]
			}, function(err,data) {
				if (err){
				response = {
				"result":"err"
				}
		res.json(response);
	}
	else{
		console.log("response from twilio message service" + data);
		console.log("\n SMS sent to :"+Num+" Body is : "+ response.output.text[0] );
			response = {
				"result":"msg"
				}
				res.json(response); //sends JSON response to HTML
			}
		});
	});
  })
  // Sending User message to Watson to process it
		function sendToWatson(cont, inp, callback) {
			var payload = {
				workspace_id:'bea698db-6104-403a-810b-15de971e3ad1',
				context: cont,
				input: {
				"text": inp
					}
		};
 
		var conversation = new ConversationV1({
			username:'748ef460-fd02-4f15-a2bd-00958c505cc3',
			password: '8yntLnulpzK2',
		version_date: '2017-06-01'
	});
//Conversation Starts
		conversation.message(payload, function(err, data1) {
			if (err) {
				console.log("err during conversation payload" + err)
			}
			else{
			contextw = data1.context;  //Updating Context Variable
			var data = JSON.stringify(data1)
			console.log("Data is: \n "+data1.output);
			var node = data1.output.nodes_visited[0];
  /**
  *
  *Taking Student Branch to find in Database
  */
  
  //data1.context.TypeOfExam != null || data1.context.RegdNum != null
	var node = data1.output.nodes_visited[0];
		if(node == 'Exams' || node == 'RegNum' || node == 'ExamType'){
			flag = 0;
		if( data1.context.TypeOfExam != null){
			ExamType = data1.context.TypeOfExam;
		}
		if(data1.context.RegdNum != null){    
			var RollNum = data1.context.RegdNum;
				if((RollNum != null))
		{
			console.log(RollNum);
			var roll = RollNum.charAt(7);
				if(roll == '5'){
					db = "cse";
				} else
			if(roll == '1'){
				db = "civil";
				}else
			if(roll == '2'){
				db = "eee";
				}else 
			if(roll = '3'){
				db = "mech";
				}else
			if(roll = '4'){
				db = "ece";
				}
				console.log(db);
			}
		}
	}
     }
  
    if(ExamType!=null ){
        if(RollNum != null){
        console.log("All data recieved" );
               flag = 1;
        var dba = cloudant.db.use(db);
        dba.get(ExamType,function(err,dataBase){
            if(err){
                console.log("Error occured : "+err);
            }
            else{
                 var dataa = dataBase.data;
			   var data = {
				   output:{
					   text:["Heyy, your "+ dataa.ExamType +"Examination Starts from "+dataa.startDate+" And Schedule is as follows :"+dataa.sub1+"-"+dataa.date1+","+dataa.sub2+"-"+dataa.date2+","+dataa.sub3+"-"+dataa.date3]
				   }
			   }	
               ExamType = null;
               RegdNum = null;	
			   flag = 0;    
			callback(data)
            }
        })
    }
}
if(flag == 0){
    console.log("Output : "+data1.output.text[0]);
    callback(data1);
}
  })
}
/**
 * Accessing Conversation through SMS
 * Twilio will send HTTP post request to '/sms' containing the user information
 */
 
app.post('/sms',function(req,res){
	console.log("/sms");
	console.log(res.req.body);
	var Num = res.req.body.From;
   var Msg = res.req.body.Body;
   console.log(Msg);
   console.log(Num)
	var client = twilio(twilioSid, twilioToken);
	sendToWatson(contextw, Msg, function(response) {
        console.log("Twilio got :" + response.output.text[0]);
		console.log("ExamType"+ExamType+"\n RegdNum:"+RegdNum);
	 client.messages.create({
     to:Num,
     from:'+13123456222', 			// Twilio number
     body: response.output.text[0]
    }, function(err, data) {
     if (err){
		 console.log("Error Occured : "+ err);
	}
	else{
     console.log("SMS sent to user is :"+response.output.text[0]);
	 console.log("Twilio Response is:"+data);
	 }
		})
	})
})
/**
 * Starting Server in localhost
 */
	var server = app.listen(port, function () {
		console.log('Miracle Assistance Bot started at localhost:3001');
	});