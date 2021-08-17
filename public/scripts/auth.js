// authentication status listener
auth.onAuthStateChanged(async function(user) {
	if (user) {
		console.log(sharedUID);
		console.log('user logged in: ', user);
		const usersRef = db.collection('users').doc(sharedUID);
		const doc = await usersRef.get().then((doc) => {
			return doc;
		});
		console.log(doc);
		console.log(doc.exists);
		if (doc.exists) {
			$(':mobile-pagecontainer').pagecontainer('change', '#sharedList');
		} else {
			sharedUID = undefined;
			$(':mobile-pagecontainer').pagecontainer('change', '#homePageLogin');
		}
		// onSnapshot listens for changes in the database & calls new updateLists()
		db.collection('users').doc(auth.currentUser.uid).collection('movieList').onSnapshot(snapshot => {
			updateList('watchListPage');
			updateList('haveWatchedPage');
			updateList('sharedListPage');
		});
	} else {
		console.log('user logged out');
		$(':mobile-pagecontainer').pagecontainer('change', '#homePageNotLogin');
	}
});

// Signup with email
const signupForm = $('#signupForm');
signupForm.submit((e) => {
	e.preventDefault();

	// User info
	const email = $('#signupEmail').val();
	const password = $('#signupPassword').val();
	const fName = $('#firstName').val();
	const lName = $('#lastName').val();

	// Sign up the user
	auth.createUserWithEmailAndPassword(email, password).then((cred) => {
		console.log(cred.user);
		// create user doc in users collection with uid as doc id 
		db.collection('users').doc(cred.user.uid).set({
			firstName: fName,
			lastName: lName,
			id: cred.user.uid
		});
		// Clear form
		$('#signupForm').trigger("reset");
	}).catch((err) => {
		$('#signupForm .error').html(err.message);
	});
});

// Google Signup/SignIn
const GoogleAuth = new firebase.auth.GoogleAuthProvider();
$(document).on('click', '.googleSignInButton', ((e) => {
	e.preventDefault();
	firebase.auth().signInWithPopup(GoogleAuth).then(() => {});
}));

// Logout
$(document).on('click', '#logout, #logoutWatch, #logoutWatched, #logoutShared, #logoutAbout', ((e) => {
	e.preventDefault();
	auth.signOut().then(() => {
		console.log('user signed out');
	});
}));

// Login with email
const loginForm = $('#loginForm');
loginForm.submit((e) => {
	e.preventDefault();

	// User info
	const email = $('#loginEmail').val();
	const password = $('#loginPassword').val();

	// Login the user
	auth.signInWithEmailAndPassword(email, password).then((cred) => {
		console.log(cred.user);
		// Clear form
		$('#loginForm').trigger("reset");
	}).catch((err) => {
		$('#loginForm .error').html(err.message);
	});
});

// Popup and close email form
function openForm() {
	$('#signupForm, #loginForm').show();
}

function closeForm() {
	$(document).on('click', '.cancelbtn', ((e) => {
		$('#signupForm, #loginForm').trigger("reset");
	}));
	$('#signupForm, #loginForm').hide();
}