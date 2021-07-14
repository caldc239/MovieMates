// Signup
const signupForm = $('#signupForm');
signupForm.submit((e) => {
	e.preventDefault();

	// User info
	const email = $('#signupEmail').val();
	const password = $('#signupPassword').val();

	// Sign up the user
	auth.createUserWithEmailAndPassword(email, password).then(cred => {
		console.log(cred.user)
	});

	// Clear form & redirect user to logged-in homepage
	$('#signupForm').trigger("reset");
	$(':mobile-pagecontainer').pagecontainer('change', '#homePageLogin');

});

// Logout
const logout = $('#logout');
logout.click((e) => {
	e.preventDefault();
	auth.signOut().then(() => {
		console.log('user signed out');
	});
});

// Login
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
	$(':mobile-pagecontainer').pagecontainer('change', '#homePageLogin');
})