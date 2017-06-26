var express  = require('express');
var request  = require('request');
var mongoose = require('mongoose');
var session = require("express-session");

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(
 session({ 
  secret: 'a4f8071f-c873-4447-8ee2',
  resave: false,
  saveUninitialized: false,
 })
);

var options = { server: { socketOptions: {connectTimeoutMS: 30000 } }};
mongoose.connect('mongodb://julien.zatar:callofduty@ds133932.mlab.com:33932/movies',options, function(err) {
});

var wishListSchema = mongoose.Schema({
	id : Number,
	title : String,
	desc : String,
	popularity : Number,
	poster : String, 
	date : Date,
	average : Number,
	user_id : String
});

var whishListModel = mongoose.model('whishList',wishListSchema);

var usersSchema = mongoose.Schema ({
	name : String,
	firstname : String,
	mail : String,
	connected : Boolean, 
	password : String
});

var usersModel = mongoose.model('users', usersSchema);


app.get ('/register', function (req,res){

	var mailUser = req.query.mail; 
	var pwUser = req.query.pw;
	var firstnameUser = req.query.firstname;
	var nameUser = req.query.name;

	if (pwUser != undefined && mailUser != undefined && firstnameUser != undefined && nameUser != undefined && req.query.name != undefined) {

		usersModel.findOne( {mail : mailUser} ,  function(err,users) {

			if (users == null) {

				var newUser = new usersModel ({

					name : nameUser,
					firstname : firstnameUser,
					mail : mailUser,
					connected : true, 
					password : pwUser
				}); 

				newUser.save(function (error,users){
					console.log(users);
					req.session.name = users.name;
					req.session.firstname = users.firstname;
					req.session.DBid = users._id;
					req.session.log = true;
				});

				res.redirect ('home');

			} else {

				res.render('register', {
						action : 'register',
						error : 'compte déjà existant'
					});

	};

	});
	
	} else {

		res.render('register', {
			action : 'register',
			error : 'champs mal renseigné'
		});
	};
});
	

app.get('/login', function (req,res) {

	 var mailUser = req.query.mail; 
	 var pwUser = req.query.pw;

	 if (pwUser != undefined && mailUser != undefined) {

	 	usersModel.findOne( {mail : mailUser, password : pwUser } ,  function(err,users){

	 		if (users != null) {

	 				req.session.name = users.name;
					req.session.firstname = users.firstname;
					req.session.DBid = users._id;
					req.session.log = true;

	 			res.redirect('/home');
	 		} else {
	 			res.render('login', {
	 				action : 'login',
	 				error : 'email ou mot de passe invalide'
	 			});
	 		};

	 	});

	 } else {
	 	res.render('login', {
	 		action : 'login',
	 		error : null
	 	});
	 }

});

app.get ('/logout' , function (req,res) {

 req.session.destroy();
 
 res.redirect('/login');

});



app.get('/home', function (req, res) {

	var mailUser = req.query.mail;

		
					request("https://api.themoviedb.org/3/discover/movie?api_key=9819ed560f7ba44c757b5bec6e3f8e64&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1", function(error, response, body) {

  					body = JSON.parse(body);

  					var moviesPop = [];


  					for (var i = 0; i < body.results.length; i++) {
  		
		  			var moviesInfo = {
					
						title : body.results[i].title,
						poster : "https://image.tmdb.org/t/p/w780"+body.results[i].poster_path,
						desc : body.results[i].overview,
						id : body.results[i].id,
						vote : body.results[i].vote_count,
						liked : false
			  		};

		  		moviesPop.push(moviesInfo);

  				};

  				whishListModel.find({user_id : req.session.DBid} , function(err,whishlists){

				for (var i = 0; i < moviesPop.length; i++) {

					for (var a = 0; a < whishlists.length; a++) {

		  				if (moviesPop[i].id == whishlists[a].id ) {

		  				moviesPop[i].liked = true ;

		  				};	

					};
				};
			
	  			res.render('home',{
	  				moviesPop : moviesPop,
	  				firstname : req.session.firstname,
	  				connected : req.session.log
	  			});
			});

	});


});


app.get ('/review', function (req, res) {

	console.log(req.session.DBid);


	if (req.session.log == true ) {

	request("https://api.themoviedb.org/3/movie/"+req.query.movieid+"?api_key=9819ed560f7ba44c757b5bec6e3f8e64&language=fr-FR", function(error, response, body) {

	if (req.query.movieid != undefined ) {

		body = JSON.parse(body);

		var whishListResult = new whishListModel ({
			id : body.id,
			title : body.original_title,
			desc : body.overview,
			popularity : body.popularity,
			poster : "https://image.tmdb.org/t/p/w780"+body.poster_path,
			date : body.release_date,
			average : body.vote_average,
			user_id : req.session.DBid
		});
	
		whishListResult.save(function (error,whishListResult){
			// console.log(whishListResult);
			whishListModel.find( {user_id : req.session.DBid} , function(err,whishlists){
				// console.log(whishlists);
				res.render('review',{whishList : whishlists});
			})
		});

	} else {

		whishListModel.find({user_id : req.session.DBid} ,function(err,whishlists){
				// console.log(whishlists);
				res.render('review',{whishList : whishlists});
			});
	};

	});

	} else {

		res.redirect('login');
	}

});

app.get ('/search', function (req, res) {

		var search_user = req.query.search.toLowerCase();

		console.log(search_user);

		request("https://api.themoviedb.org/3/search/movie?api_key=9819ed560f7ba44c757b5bec6e3f8e64&language=fr-FR&query="+search_user+"&page=1&include_adult=false", function(error, response, body) {

		body = JSON.parse(body);

		console.log(body);

		var search_Movies = [];

		for (var i = 0; i < body.results.length ; i++) {
			
		search_Movies.push({
			id : body.results[i].id,
			title : body.results[i].title,
			desc : body.results[i].overview,
			popularity : body.results[i].popularity,
			poster : "https://image.tmdb.org/t/p/w780"+body.results[i].poster_path,
			date : body.results[i].release_date,		
		});

		};

		console.log(search_Movies);

		res.render('search', {moviesSearch : search_Movies});

	})

});


app.get ('/contact', function (req, res) {



	res.render('contact');

});




app.listen(8080, function () {
  console.log("Server listening on port 8080");
});