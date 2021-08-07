//global variables
var searchResults;
var selectedID;
var titleForList;

//pass user input to function movieSearch to return movie options
function movieSearch(title, callback) {
	var encoded = encodeURIComponent(title);
	//rapidapi Movie Database GET by search function
	const settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://movie-database-imdb-alternative.p.rapidapi.com/?s=" + encoded + "&page=1&type=movie&r=json",
		"method": "GET",
		"headers": {
			"x-rapidapi-key": "940e6b5ae0mshaca463d8d7a8457p1721f1jsn574406e78a5f",
			"x-rapidapi-host": "movie-database-imdb-alternative.p.rapidapi.com"
		}
	};

	// after the search has completed, parse the results into strings
	$.ajax(settings).done(function(response) {
		callback(response);
		searchResults = JSON.parse(JSON.stringify(response));
	});
}

//retrieve user input from search bar and pass to movieSearch function
$(document).on('keypress', '#addToList', ((e) => {
	if (e.which === 13) {
		$('#search').click();
	}
}));

$(document).on('click', '#search', ((e) => {
	e.preventDefault();
	var movieTitle = $('#addToList').val();
	movieSearch(movieTitle, updateSearchList);
}));

// iterate through all responses returned by the API & display them as buttons in the returned search list
async function updateSearchList(response) {
	var html = '';
	html += '<div>' + '<h2>Search Results</h2>';
	html += '</div>';
	html += '<ul class="searchList">';
	response.Search.forEach((movie) => {
		html += '<li><label><input type="button" id="button_' + movie.imdbID + '" value="';
		html += movie.Title;
		html += '"></label></li>';
	});
	html += '</ul>';
	$('#searchResponse').html(html);

	//listen for user to click desired movie
	$('.searchList * :button').on('click', async function(e) {
		e.preventDefault();
		console.log(e);
		//variable to hold extracted movie.imdbID
		var movieID = e.target.id.substring(7);
		selectedID = movieID;
		console.log(movieID);
		// iterate through search responses to find matching imdbID
		for (var i = 0; i < searchResults.Search.length; i++) {
			if (searchResults.Search[i].imdbID == movieID) {
				db.collection('movies').doc(movieID).set(searchResults.Search[i]);
				// add movieID to user's watch list collection
				const usersRef = db.collection('users').doc(auth.currentUser.uid);
				const doc = await usersRef.get().then((doc) => {
					return doc;
				});
				if (!doc.exists) {
					db.collection('users').doc(auth.currentUser.uid).collection('movieList').doc(movieID).set({
						movie: movieID,
						watched: false
					});
				} else {
					console.log('hi');
				}
				// clear searchResponse list (and search bar?)
				$('#searchResponse').empty();
				$('#addToList').val('');
				// call updateList() to display the user's list
				// await sleep(2000);
				updateList('watchListPage');
			}
		}
	});
}

/* iterate through the user's movielist, match the id's to the movies list,
 grab the data for each movie from the movies collection, get just the title
 from the data, and display the titles in a checklist in the "watch list" or
 "have-watched list" section of the user's movie page */
async function updateList(listID) {
	switch (listID) {
		case "watchListPage":
			console.log('rey');
			// iterate through user's movie list and get each imdbID
			var usersMovieRef = db.collection('users').doc(auth.currentUser.uid).collection('movieList');
			var yourData = await usersMovieRef.where("watched", "==", false).get().then((snapshot) => {
				var temp = [];
				var response = snapshot.forEach((doc) => {
					temp.push(doc.data());
				});
				return temp;
			});
			// for each imdbID from user's movie list, get matching doc from movies collection
			//$('#watchListContent').empty();
			var html = '';
			html += '<div><h2>Watch List</h2></div>';
			for (var doc of yourData) {
				// console.log(doc);
				var documentReference = db.collection('movies').doc(doc.movie);
				var yourNewData = await documentReference.get().then((data) => {
					return data.data();
				});
				titleForList = yourNewData.Title;
				html += '<li><label class="checkbox-inline">';
				html += '<input type="checkbox" id="chbx_' + yourNewData.imdbID +
					'" value ="" onClick="checkboxListener(\'watchListPage\')">';
				html += titleForList;
				html += '</label></li>';
				//$('#watchListContent').append('<li><label class = "checkbox-inline"><input type = "checkbox" value="">' +
				//titleForList + '</label></li>');
			}
			html += '<button type="button" id="addBtn" disabled>Watched!</button>';
			html += '<button type="button" id="deleteBtn" disabled>Delete</button>';
			$('#' + listID).html(html);
			$('#addBtn').click(function(e) {
				e.preventDefault();
				console.log('howdy');
				moveToWatchedList('watchListPage');
			});
			break;
		case "haveWatchedPage":
			console.log('cass');
			// iterate through user's movie list and get each imdbID
			var usersMovieRef = db.collection('users').doc(auth.currentUser.uid).collection('movieList');
			var yourData = await usersMovieRef.where("watched", "==", true).get().then((snapshot) => {
				var temp = [];
				var response = snapshot.forEach((doc) => {
					temp.push(doc.data());
				});
				return temp;
			});
			// for each imdbID from user's movie list, get matching doc from movies collection
			//$('#watchListContent').empty();
			var html = '';
			html += '<div><h2>Have-Watched List</h2></div>';
			for (var doc of yourData) {
				// console.log(doc);
				var documentReference = db.collection('movies').doc(doc.movie);
				var yourNewData = await documentReference.get().then((data) => {
					return data.data();
				});
				titleForList = yourNewData.Title;
				html += '<li><label class="checkbox-inline">';
				html += '<input type="checkbox" id="chbx_' + yourNewData.imdbID +
					'" value ="" onClick="checkboxListener(\'haveWatchedPage\')">';
				html += titleForList;
				html += '</label></li>';
				//$('#watchListContent').append('<li><label class = "checkbox-inline"><input type = "checkbox" value="">' +
				//titleForList + '</label></li>');
			}
			html += '<button type="button" id="watchBtn" disabled>Move to watch list</button>';
			html += '<button type="button" id="dltBtn" disabled>Delete</button>';
			$('#' + listID).html(html);
			$('#watchBtn').click(function(e) {
				e.preventDefault();
				console.log('howdy');
				moveToWatchList('haveWatchedPage');
			});
			break;
		default:
			console.log('uh oh');
	}
}

// function checkboxCheck() that checks the checkboxes, then calls either
// moveToWatchedList or movetoWatchList based on the button clicked
function checkboxCheck(listID) {
	var chbxArray = [];
	// verify which list in which user clicked or checked desired movie(s)
	$('#' + listID + ' * input[type="checkbox"]').each(function() {
		if ($(this).prop('checked')) {
			console.log('hi');
			// extract chbxID (imdbID)
			var chbxID = $(this).attr('id').substring(5);
			chbxArray.push(chbxID);
		}
	});
	console.log(chbxArray);
	return chbxArray;
}

function checkboxListener(listID) {
	var list = checkboxCheck(listID);
	// activate buttons for "watched" and "delete"
	switch (listID) {
		case "watchListPage":
			$('#addBtn').prop('disabled', (list.length == 0));
			$('#deleteBtn').prop('disabled', (list.length == 0));
			break;
		case "haveWatchedPage":
			$('#watchBtn').prop('disabled', (list.length == 0));
			$('#dltBtn').prop('disabled', (list.length == 0));
			break;
	}
}

async function moveToWatchedList(listID) {
	var temp = checkboxCheck(listID);
	console.log(temp);
	// set "watched" field in doc to "true"
	for (var i = 0; i < temp.length; i++) {
		console.log('1');
		await db.collection('users').doc(auth.currentUser.uid).collection('movieList').doc(temp[i]).update({
			watched: true
		});
	}
	console.log('2');
}

async function moveToWatchList(listID) {
	// set "watched" field in doc to "false"
	var temp = checkboxCheck(listID);
	console.log(temp);
	// set "watched" field in doc to "true"
	for (var i = 0; i < temp.length; i++) {
		console.log('3');
		await db.collection('users').doc(auth.currentUser.uid).collection('movieList').doc(temp[i]).update({
			watched: false
		});
	}
	console.log('4');
}

function deleteFromList() {
	// delete from firestore db
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO:
// if user selects "watch," move to watch list and remove from watched list
// change matching field in firestore doc (ie watched: true --> watched = false)
// if user selects "delete," remove from any list (and users movie list?)
// sort lists
// display movie info on click? maybe "i" button next to each one?
// email for support