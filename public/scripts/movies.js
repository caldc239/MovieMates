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

// Retrieve user input from search bar via click or enter
// and pass to movieSearch function
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

// iterate through all responses returned by the API & display them
// as buttons in the returned search list
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
				// clear searchResponse list and search bar
				$('#searchResponse').empty();
				$('#addToList').val('');
				// call updateList() function and pass watchListPage as the parameter
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
			// iterate through user's movie list and get each imdbID
			var usersMovieRef = db.collection('users').doc(auth.currentUser.uid).collection('movieList');
			var yourData = await usersMovieRef.where("watched", "==", false).get().then((snapshot) => {
				var temp = [];
				var response = snapshot.forEach((doc) => {
					temp.push(doc.data());
				});
				return temp;
			});

			var html = '';
			html += '<div><h2>Watch List</h2></div>';
			html += '<p>Total movies to watch: ';
			html += yourData.length;
			html += '</p>';
			for (var doc of yourData) {
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
			}
			html += '<button type="button" id="addBtn" disabled>Watched!</button>';
			html += '<button type="button" id="deleteBtn" disabled>Delete</button>';
			$('#' + listID).html(html);
			// listen for user to click add or delete buttons and call appropriate function
			$('#addBtn').click(function(e) {
				e.preventDefault();
				moveToWatchedList('watchListPage');
			});
			$('#deleteBtn').click(function(e) {
				e.preventDefault();
				deleteFromList('watchListPage');
			});
			break;

		case "haveWatchedPage":
			// iterate through user's movie list and get each imdbID
			var usersMovieRef = db.collection('users').doc(auth.currentUser.uid).collection('movieList');
			var yourData = await usersMovieRef.where("watched", "==", true).get().then((snapshot) => {
				var temp = [];
				var response = snapshot.forEach((doc) => {
					temp.push(doc.data());
				});
				return temp;
			});

			var html = '';
			html += '<div><h2>Have-Watched List</h2></div>';
			html += '<p>Total movies you have watched: ';
			html += yourData.length;
			html += '</p>';
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
				html += '</label>'
				html += '<img src="/images/Info_simple_bw.svg" class="info_img" onClick="showInfo(\'' + yourNewData.imdbID + '\')">';
				html += '</li>';
				// hidden div
				html += '<div class= "infoBox" id="info_' + yourNewData.imdbID + '">';
				html += '<center><p>';
				html += yourNewData.imdbID;
				html += '</p>';
				html += '<button type="button" onClick="hideInfo(\'' + yourNewData.imdbID + '\')">Close</button>';
				html += '</center>';
				html += '</div>';
			}
			html += '<button type="button" id="watchBtn" disabled>Move to watch list</button>';
			html += '<button type="button" id="dltBtn" disabled>Delete</button>';
			$('#' + listID).html(html);
			// listen for user to click move or dlt buttons and call appropriate function
			$('#watchBtn').click(function(e) {
				e.preventDefault();
				moveToWatchList('haveWatchedPage');
			});
			$('#dltBtn').click(function(e) {
				e.preventDefault();
				console.log('welcome');
				deleteFromList('haveWatchedPage');
			});
			//$('button').button();
			break;
		default:
			console.log('uh oh');
	}
}

// checkboxCheck() checks for checked boxes in a given list (listID)
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

// checkboxListener() activates buttons on the appropriate list
// (listID) if any checkbox is checked
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

// moveToWatchedList() moves checked movies from "watch" to "have-watched" list
// by setting the "watched" field to true
async function moveToWatchedList(listID) {
	var temp = checkboxCheck(listID);
	console.log(temp);
	// set "watched" field in doc to "true"
	for (var i = 0; i < temp.length; i++) {
		await db.collection('users').doc(auth.currentUser.uid).collection('movieList').doc(temp[i]).update({
			watched: true
		});
	}
}

// moveToWatchList() moves checked movies from "have-watched" to "watch" list
// by setting the "watched" field to false
async function moveToWatchList(listID) {
	// get array of checked movies
	var temp = checkboxCheck(listID);
	console.log(temp);
	// set "watched" field in doc to "false"
	for (var i = 0; i < temp.length; i++) {
		await db.collection('users').doc(auth.currentUser.uid).collection('movieList').doc(temp[i]).update({
			watched: false
		});
	}
}

// deleteFromList() removes checked movies from a given list by deleting the doc
// from the user's collection in the database
async function deleteFromList(listID) {
	// get array of checked movies
	var temp = checkboxCheck(listID);
	console.log(temp);
	// set "watched" field in doc to "false"
	for (var i = 0; i < temp.length; i++) {
		// delete from firestore db
		await db.collection('users').doc(auth.currentUser.uid).collection('movieList').doc(temp[i]).delete().then(() => {
			console.log("Document successfully deleted");
		}).catch((error) => {
			console.log("Error removing document: ", error);
		});
	}
}

function showInfo(imdbID) {
	$('#info_' + imdbID).show()
}

function hideInfo(imdbID) {
	$('#info_' + imdbID).hide()
}

// sleep() pauses a function for a set amount of ms
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO:
// sort lists
// display movie info on click? maybe "i" button next to each one?
// build hidden div for every movie with id of info_ + imdbID
//
// email for support
// move logout button?