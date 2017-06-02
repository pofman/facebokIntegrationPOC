# Testing Facebook GRAPH API

Create in the config folder a file called config.js with the following structure

module.exports = {
    client_id: '{your client id}',
    client_secret: '{your client secret id}',
    scope: 'email, user_about_me, user_birthday, user_likes, user_location, user_managed_groups, user_posts, publish_actions',
    // You have to set http://localhost:3000/ as your website
    // using Settings -> Add platform -> Website
    redirect_uri: 'http://localhost:3000/auth'
};