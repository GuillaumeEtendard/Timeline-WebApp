const path = require('path');
const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

// Array with all posts
this.allPosts = [];

io.on('connection', socket => {

    let currentUser = {
        _id: null,
        username: null
    };

    // Listen event for login
    socket.on('login', user => {
        currentUser._id = socket.id;
        currentUser.username = user.username;

        // Emit socket with new user
        socket.broadcast.emit('newUser', currentUser);

        console.log(this.allPosts);

        socket.emit('allPosts', this.allPosts);
    });

    // Listen event for add a post
    socket.on('newPost', post => {
        // Attribute to post an random generated id
        post._id = '_' + Math.random().toString(36).substr(2, 9);
        // Emit the new post with id
        io.emit('newPost', post);

        // Push the new post to posts array
        this.allPosts.push(post);
        console.log(this.allPosts);
    });

    // Listen event for delete a post
    socket.on('deletePost', post => {
        // Find the post with given id and remove it from posts array
        let index = this.allPosts.findIndex(i => i._id === post._id);
        if (index > -1) {
            this.allPosts.splice(index, 1);
        }
        // Emit the deleted post
        io.emit('deletePost', post);
    });

    socket.on('favoritePost', post => {
        let index = post.favorites.findIndex(i => i._id === currentUser._id);
        console.log(index);
        if (index === -1) {
            post.favorites.push(currentUser);
        }
        console.log(post);
        io.emit('favoritePost', post);
    })
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Le serveur écoute sur le port ${port}`));