<!DOCTYPE html>
<html lang="en">

  <head>
    <!-- Created by Cassaundra Caldwell
      Date Created: 29 June 2021
      Date Modified: 2 July 2021
      Description: MovieMates is a web app designed to track movies and TV shows
      a user wants to watch or has watched, provide basic info about them, and
      provide users with the ability to share their lists with friends. -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MovieMates</title>

    <!-- CSS -->
    <link rel="stylesheet" href="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css" />

    <!-- JS -->
    <script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
    <script src="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>

    <!-- PHP -->
    <?php

    require_once('settings.php');

    $login_url = 'https://accounts.google.com/o/oauth2/v2/auth?scope=' . urlencode('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email') . '&redirect_uri=' . urlencode(CLIENT_REDIRECT_URL) . '&response_type=code&client_id=' . CLIENT_ID . '&access_type=online';

?>

  </head>

  <body>

    <!-- Home page -->
    <div data-role="page" id="homePage">
      <!-- header -->
      <div data-role="header">
        <h1>Home Page</h1>
      </div><!-- /header -->
      <div data-role="content">
        <p>Helllllllllllllo there</p>
        <p><a href="<?= $login_url ?>">Login with Google</a></p>
      </div>
    </div>

    <!-- Watch List -->
    <div data-role="page" id="watchList">
      <div data-role="header">
        <h1>Watch List</h1>
      </div>
      <div data-role="content">
        <p>This is a watch list</p>
      </div>
    </div>

    <!-- Have-Watched List -->
    <div data-role="page" id="alreadyWatched">
      <div data-role="header">
        <h1>Have-Watched List</h1>
      </div>
      <div data-role="content">
        <p>This is a have-watched list</p>
      </div>
    </div>

  </body>

</html>
