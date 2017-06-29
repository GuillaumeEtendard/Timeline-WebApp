const app = angular.module('TimelineApp', []);

app.controller('TimelineController', ['$scope', function ($scope) {

    let timeline = this;
    timeline.socket = io('ws://localhost:3000');

    // User isConnected : false (default)
    timeline.isConnected = false;

    timeline.currentUser = {
        username: null
    };

    timeline.posts = [];

    // User login function
    timeline.login = function () {
        // Set isConnected to true
        timeline.isConnected = true;

        // set user username to currentUser
        timeline.currentUser.username = timeline.username;

        // emit socket 'login' with currentUser
        timeline.socket.emit('login', timeline.currentUser);

        timeline.socket.on('allPosts', function (posts) {
            timeline.posts = posts;
            $scope.$apply();
        });

        // Listen server event for add a post
        timeline.socket.on('newPost', function (post) {
            // Push the new post to posts array
            timeline.posts.push(post);
            $scope.$apply();
        });

        // Listen server event for delete a post
        timeline.socket.on('deletePost', function (deletePost) {
            // Delete the post from posts array
            timeline.posts = timeline.posts.filter(function(post) {
                return post._id !== deletePost._id;
            });
            $scope.$apply(); // Force les changements au niveau de la vue
        });

        timeline.socket.on('favoritePost', function (post) {
            let index = timeline.posts.findIndex(i => i._id === post._id);
            if (index > -1) {
                timeline.posts[index].favorites = post.favorites;
            }
            $scope.$apply();
        });
    };


    // Add post to timeline
    timeline.addPost = function () {
        if (!timeline.postText || timeline.postText.trim() === '') {
            return;
        }

        // If no given url, attribute default url
        if (!timeline.postUrl || timeline.postUrl.trim() === '') {
            timeline.postUrl = 'https://www.smashingmagazine.com/wp-content/uploads/2015/06/10-dithering-opt.jpg';
        }

        timeline.newPost = {
            author: timeline.currentUser,
            url: timeline.postUrl,
            text: timeline.postText,
            date: new Date().getTime(),
            favorites : []
        };

        // Emit socket with the new post
        timeline.socket.emit('newPost', timeline.newPost);

        timeline.postUrl = '';
        timeline.postText = '';
    };

    // Delete post function
    timeline.deletePost = function(deletePost){
        // Emit socket with the post to delete
        timeline.socket.emit('deletePost', deletePost);
    };

    timeline.favoritePost = function(favoritePost){
        timeline.socket.emit('favoritePost', favoritePost);
    }
}]);