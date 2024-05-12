const express = require('express');
const app = express();
const knex = require('knex')(require('./knexfile').development);
const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(session({
    secret: 'verySecretValue',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Ustaw na `true` jeśli używasz HTTPS
}));

app.get('/', async (req, res) => {
    let userName = 'Nieznajomy';
    if (req.session.user) {
        userName = req.session.user;
    } else if (req.cookies.username) {
        userName = req.cookies.username;
        req.session.user = userName;
    }
    try {
        const users = await knex('users').select('*');
        const posts = await knex('posts').select('*');
        res.render('index', { users, userName, posts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await knex('users').where({ name: username, password: password }).first();
        if (user) {
            req.session.user = { id: user.id, name: user.name };
            res.cookie('username', user.name, { maxAge: 900000, httpOnly: true });
            res.redirect('/');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Błąd podczas niszczenia sesji', err);
            return res.status(500).send('Nie udało się wylogować');
        }
        res.clearCookie('username');
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        await knex('users').insert({
            name: username,
            password: password
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to register');
    }
});

app.get('/posts/new', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('create-post');
});

app.post('/posts', async (req, res) => {
    const { title, content } = req.body;
    const userId = req.session.user.id;

    try {
        await knex('posts').insert({
            title: title,
            content: content,
            user_id: userId
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating post');
    }
});

app.get('/posts/:id', async (req, res) => {
    let userName = 'Nieznajomy';
    if (req.session.user) {
        userName = req.session.user;
    } else if (req.cookies.username) {
        userName = req.cookies.username;
        req.session.user = userName;
    }
    const postId = req.params.id;
    try {
        const post = await knex('posts').where({ id: postId }).first();
        const comments = await knex('comments').where({ post_id: postId });
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('post-details', { userName, post, comments });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/comments/:postId', async (req, res) => {
    const { comment } = req.body;
    const postId = req.params.postId;
    const userId = req.session.user ? req.session.user.id : null;
    if (!userId) {
        return res.status(401).send("You must be logged in to post comments.");
    }
    try {
        await knex('comments').insert({
            comment: comment,
            post_id: postId,
            user_id: userId
        });
        res.redirect(`/posts/${postId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to add comment');
    }
});

app.get('/posts/edit/:id', async (req, res) => {
    const postId = req.params.id;
    if (!req.session.user) {
        return res.redirect('/login');
    }
    try {
        const post = await knex('posts').where({ id: postId, user_id: req.session.user.id }).first();
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('edit-post', { post });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching post');
    }
});

app.post('/posts/edit/:id', async (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    try {
        await knex('posts').where({ id: postId, user_id: req.session.user.id }).update({
            title: title,
            content: content
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating post');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));