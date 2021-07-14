// Signup
const signupForm = $('#signupForm');
signupForm.submit((e) => {
	e.preventDefault();

	// user info
	const email = $('#signupEmail').val();
	const password = $('#signupPassword').val();

	// sign up the user
	auth.createUserWithEmailAndPassword(email, password).then(cred => {
		console.log(cred.user)
	});

	$('#signupForm').trigger("reset");
	$(':mobile-pagecontainer').pagecontainer('change', '#homePageLogin');

});

//Logout
const logout = $('#logout');
logout.click((e) => {
	e.preventDefault();
	auth.signOut().then(() => {
		console.log('user signed out');
	});
});