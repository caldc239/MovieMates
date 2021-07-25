// authentication status listener
auth.onAuthStateChanged(user => {
	if (user) {
		console.log('user logged in: ', user);
		$(':mobile-pagecontainer').pagecontainer('change', '#homePageLogin');
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

	// Sign up the user
	auth.createUserWithEmailAndPassword(email, password).then((cred) => {
		console.log('bacon');
		console.log(cred.user);
		// Clear form & redirect user to logged-in homepage
		$('#signupForm').trigger("reset");
		//$(':mobile-pagecontainer').pagecontainer('change', '#homePageLogin');
	}).catch((err) => {
		console.log('beep');
		$('#signupForm .error').html(err.message);
	});
});

// Google Signup/SignIn
const GoogleAuth = new firebase.auth.GoogleAuthProvider();
$(document).on('click', '#signupGoogle, #signinGoogle', ((e) => {
	e.preventDefault();
	firebase.auth().signInWithPopup(GoogleAuth).then(() => {});
}));

// Logout
$(document).on('click', '#logout, #logoutWatch, #logoutWatched', ((e) => {
	e.preventDefault();
	auth.signOut().then(() => {
		console.log('user signed out');
	});

	//$(':mobile-pagecontainer').pagecontainer('change', '#homePageNotLogin');
}));

// Login with email
const loginForm = $('#loginForm');
loginForm.submit((e) => {
	e.preventDefault();

	// User info
	const email = $('#loginEmail').val();
	const password = $('#loginPassword').val();

	// Login the user
	auth.signInWithEmailAndPassword(email, password).then(cred => {
		console.log(cred.user)
	});

	// Clear form & redirect user to logged-in homepage
	$('#loginForm').trigger("reset");
	//$(':mobile-pagecontainer').pagecontainer('change', '#homePageLogin');
})

// Popup and close email form
function openForm() {
	$('#signupForm, #loginForm').show();
}

function closeForm() {
	$('#signupForm, #loginForm').hide();
}