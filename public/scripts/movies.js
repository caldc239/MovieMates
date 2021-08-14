//global variables
var searchResults;

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
		console.log(movieID);
		// iterate through search responses to find matching imdbID
		for (var i = 0; i < searchResults.Search.length; i++) {
			if (searchResults.Search[i].imdbID == movieID) {
				await db.collection('movies').doc(movieID).set(searchResults.Search[i]);
				// add movieID to user's watch list collection
				await db.collection('users').doc(auth.currentUser.uid).set({
					id: auth.currentUser.uid
				}, {
					merge: true
				});
				await db.collection('users').doc(auth.currentUser.uid).collection('movieList').doc(movieID).set({
					movie: movieID,
					watched: false
				});
				// clear searchResponse list and search bar
				alert('Movie added to watch list!');
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
			var usersMovieRefWatch = db.collection('users').doc(auth.currentUser.uid).collection('movieList');
			var watchData = await usersMovieRefWatch.where("watched", "==", false).get().then((snapshot) => {
				var temp = [];
				var response = snapshot.forEach((doc) => {
					temp.push(doc.data());
				});
				return temp;
			});
			// iterate through movie list to match user's movieID to movie in database to get the title
			var html = '';
			html += '<div><h2>Watch List</h2></div>';
			html += '<p>Total movies to watch: ';
			html += watchData.length;
			html += '</p>';
			for (var doc of watchData) {
				var documentReference = db.collection('movies').doc(doc.movie);
				var newWatchData = await documentReference.get().then((data) => {
					return data.data();
				});

				// displays titles in checkbox list
				html += '<li><label class="checkbox-inline">';
				html += '<input type="checkbox" id="chbx_' + newWatchData.imdbID +
					'" value ="" onClick="checkboxListener(\'watchListPage\')">';
				html += newWatchData.Title;
				html += '</label>';
				html += '<img src="/images/Info_Simple_bw.svg" alt="info logo" class="info_img" onClick="showInfo(\'' + newWatchData.imdbID + '\')">';
				html += '</li>';

				// hidden div
				html += '<div class= "infoBox" id="info_' + newWatchData.imdbID + '">';
				html += '<center><p>';
				html += '<img src ="' + newWatchData.Poster + '" class="imdb_Img">';
				html += '<br>' + newWatchData.Title;
				html += '<br>' + newWatchData.Year;
				html += '</p>';
				html += '<button type="button" onClick="hideInfo(\'' + newWatchData.imdbID + '\')">Close</button>';
				html += '</center>';
				html += '</div>';
			}
			html += '<button type="button" id="addBtn" class="ui-btn ui-btn-inline" disabled>Watched!</button>';
			html += '<button type="button" id="deleteBtn" class="ui-btn ui-btn-inline" disabled>Delete</button>';
			html += '<h3>Share your list with friends!</h3>';
			html += '<p>Copy the link below:</p>';
			html += '<br><input type="text" value="moviemates-318318.web.app/?uid=' + auth.currentUser.uid + '"id="shareLink" readonly>';
			html += '<button class="ui-btn ui-btn-inline" onClick="copyShare()">Copy link</button>';
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
			$(document).mouseup(function(e) {
				var container = $('.infoBox');
				if (!container.is(e.target) && container.has(e.target).length === 0) {
					container.hide();
				}
			});
			break;

		case "haveWatchedPage":
			// iterate through user's movie list and get each imdbID
			var usersMovieRefWatched = db.collection('users').doc(auth.currentUser.uid).collection('movieList');
			var watchedData = await usersMovieRefWatched.where("watched", "==", true).get().then((snapshot) => {
				var temp = [];
				var response = snapshot.forEach((doc) => {
					temp.push(doc.data());
				});
				return temp;
			});

			var html = '';
			html += '<div><h2>Have-Watched List</h2></div>';
			html += '<p>Total movies you have watched: ';
			html += watchedData.length;
			html += '</p>';
			for (var doc of watchedData) {
				// console.log(doc);
				var docReference = db.collection('movies').doc(doc.movie);
				var newWatchedData = await docReference.get().then((data) => {
					return data.data();
				});
				html += '<li><label class="checkbox-inline">';
				html += '<input type="checkbox" id="chbx_' + newWatchedData.imdbID +
					'" value ="" onClick="checkboxListener(\'haveWatchedPage\')">';
				html += newWatchedData.Title;
				html += '</label>';
				html += '<img src="/images/Info_Simple_bw.svg" alt="info logo" class="info_img" onClick="showInfo(\'' + newWatchedData.imdbID + '\')">';
				html += '</li>';
				// hidden div
				html += '<div class= "infoBox" id="info_' + newWatchedData.imdbID + '">';
				html += '<center><p>';
				html += '<img src ="' + newWatchedData.Poster + '" class="imdb_Img">';
				html += '<br>' + newWatchedData.Title;
				html += '<br>' + newWatchedData.Year;
				html += '</p>';
				html += '<button type="button" onClick="hideInfo(\'' + newWatchedData.imdbID + '\')">Close</button>';
				html += '</center>';
				html += '</div>';
			}
			html += '<button type="button" id="watchBtn" class="ui-btn ui-btn-inline" disabled>Move to watch list</button>';
			html += '<button type="button" id="dltBtn" class="ui-btn ui-btn-inline" disabled>Delete</button>';
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
			$(document).mouseup(function(e) {
				var container = $('.infoBox');
				if (!container.is(e.target) && container.has(e.target).length === 0) {
					container.hide();
				}
			});
			break;
		case "sharedListPage":
			// iterate through user's movie list and get each imdbID
			if (sharedUID == undefined) return;

			var usersMovieRefShared = db.collection('users').doc(sharedUID).collection('movieList');
			var sharedData = await usersMovieRefShared.where("watched", "==", false).get().then((snapshot) => {
				var temp = [];
				var response = snapshot.forEach((doc) => {
					temp.push(doc.data());
				});
				return temp;
			});

			var html = '';
			html += '<div><h2>Your Friend\'s Watch List</h2></div>';
			html += '<p>Total movies to watch: ';
			html += sharedData.length;
			html += '</p>';
			for (var doc of sharedData) {
				var docRef = db.collection('movies').doc(doc.movie);
				var newSharedData = await docRef.get().then((data) => {
					return data.data();
				});
				html += '<li><label class="checkbox-inline">';
				html += '<input type="checkbox" id="chbx_' + newSharedData.imdbID +
					'" value ="" onClick="checkboxListener(\'sharedListPage\')">';
				html += newSharedData.Title;
				html += '</label>';
				html += '<img src="/images/Info_Simple_bw.svg" alt="info logo" class="info_img" onClick="showInfo(\'' + newSharedData.imdbID + '\')">';
				html += '</li>';
				// hidden div
				html += '<div class= "infoBox" id="info_' + newSharedData.imdbID + '">';
				html += '<center><p>';
				html += '<img src ="' + newSharedData.Poster + '" class="imdb_Img">';
				html += '<br>' + newSharedData.Title;
				html += '<br>' + newSharedData.Year;
				html += '</p>';
				html += '<button type="button" onClick="hideInfo(\'' + newSharedData.imdbID + '\')">Close</button>';
				html += '</center>';
				html += '</div>';
			}
			html += '<button type="button" id="sharedAddBtn" class="ui-btn ui-btn-inline" disabled>Add to my list</button>';
			$('#' + listID).html(html);
			// listen for user to click add or delete buttons and call appropriate function
			$('#sharedAddBtn').click(function(e) {
				e.preventDefault();
				addToWatchList('sharedListPage');
			});
			$(document).mouseup(function(e) {
				var container = $('.infoBox');
				if (!container.is(e.target) && container.has(e.target).length === 0) {
					container.hide();
				}
			});
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
		case "sharedListPage":
			$('#sharedAddBtn').prop('disabled', (list.length == 0));
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

// addToWatchList() adds shared movies to a user's list
async function addToWatchList(listID) {
	// get array of checked movies
	var temp = checkboxCheck(listID);
	// set "watched" field in doc to "false"
	for (var i = 0; i < temp.length; i++) {
		await db.collection('users').doc(auth.currentUser.uid).collection('movieList').doc(temp[i]).set({
			movie: temp[i],
			watched: false
		});
	}
}

function showInfo(imdbID) {
	$('#info_' + imdbID).show();
}

function hideInfo(imdbID) {
	$('#info_' + imdbID).hide();
}

// sleep() pauses a function for a set amount of ms
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// get uid from current url
function GetURLParameter(param) {
	var pageURL = window.location.search.substring(1);
	var sURLVariables = pageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == param) {
			return sParameterName[1];
		}
	}
	return undefined;
}

var sharedUID = GetURLParameter("uid");

function copyShare() {
	var copyText = $('#shareLink');
	console.log(copyText);
	// Select the link to copy
	copyText.select();
	// Copy text in text field
	document.execCommand("copy");
	// Tell user it's copied
	alert("Link copied to clipboard!");
}

// TODO:
// sort lists
// add toast for added to watch list
// move logout button?