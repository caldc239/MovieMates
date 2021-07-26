//global function to hold API search request
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

	$.ajax(settings).done(function(response) {
		//console.log(response);
		callback(response);
		searchResults = JSON.parse(JSON.stringify(response));
		console.log(searchResults);
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
	movieSearch(movieTitle, updateList);
}));

function updateList(response) {
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
	$('.searchList * :button').on('click', ((e) => {
		e.preventDefault();
		console.log(e);
		//variable to hold extracted movie.imdbID
		var movieID = e.target.id.substring(7);
		console.log(movieID);
		// iterate through search responses to find matching imdbID
		for (var i = 0; i < searchResults.Search.length; i++) {
			if (searchResults.Search[i].imdbID == movieID) {
				db.collection('movies').doc(movieID).set(searchResults.Search[i]);
				// check if user id exists in db.collection, if not add them and set blank field?
				// check if movieID exists in user's watch list collection
				// if it doesnt exist, add movieID to user's watch list collection
				// call updateWatchList() to display the user's list
			}
		}
	}));
}

/*function updateWatchList() {
	//append to html in Watch List with label checkbox-inline
	var html = '';
	html += '<div><h2>Watch List</h2></div>';
	html += '<ul class="addedWatchList">';
	html += '<li><label class="checkbox-inline">'
	html += '<input type = "checkbox" value = "" >'
	html +=
		html += '</label></li>'
	html += '</ul>';

}));
//clear searchResponse list (and search bar?)
}*/

function moveToWatchedList() {
	//listen for user to click or check desired movie
	//append to html in Watched List
	//remove movie from Watch List
}