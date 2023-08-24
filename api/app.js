const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');
const bodyParser = require('body-parser');



//Load in the mongoose models

const { List, Task, User } = require('./db/models');
const jwt = require('jsonwebtoken');

/* MIDDLEWARE */

// Load middleware
app.use(bodyParser.json());

//CORS HEADER MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header("Access-Control-Expose-Headers", "x-access-token, x-refresh-token");
    next();
});

//   Check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    if (req.body.email === 'admin@test.com' && req.body.password === 'adminadmin') {
        req.user = { isAdmin: true }; // Assume admin user
        return next(); // Bypass middleware for admin
      }
      
    let token = req.header('x-access-token');

    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // There was an error, do not auth
            res.status(401).send(err);
        } else {
            // Jwt is valid
            req.user_id = decoded._id;
            next();
        }
    })
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // Grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // Grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }

        // If the code reaches here - the user was found
        // Therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // Check if the session is expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // Refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // The session is valid - call next() to continue with processing this web request
            next();
        } else {
            // Session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }
    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* END MIDDLEWARE */

/* ROUTE HANDLERS */


/* LIST ROUTES */


//GET /lists to get all lists
app.get('/lists', authenticate, (req, res) => {
    //res.send("Hello World!");
    // We want to return an array of all the lists that belong to the authenticated user
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
});

//POST /lists to create lists
app.post('/lists', authenticate, (req, res) => {
    //We want to create a new list and return the new list doucemnt back to the user which includes the id
    //the list info will be passed in via the JSON request body
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
    });
    newList.save().then((listDoc) => {
        // the full list document is returned
        res.send(listDoc);
    })
});

//PATCH /lists/:id update a specified list
app.patch('/lists/:id', authenticate, (req, res) => {
    //We want to update the specifeid list with the new values spceified in the JSON body of the request
    List.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id }, {
        $set: req.body
    }).then(() => {
        res.send({'message': 'updated successfully'});
    });
});

app.delete('/lists/:id', authenticate, (req, res) => {
    //We want to delete the specified list
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);

        // Delete all the tasks that are in the deleted list
        deleteTasksFromLists(removedListDoc._id);
    });
});

/* TASK ROUTES */

//GET /lists/:listId/tasks to get all tasks from a specific list
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    Task.find({
        _listId: req.params.listId // Use req.params.listId instead of req.params._listId
    }).then((tasks) => {
        res.send(tasks);
    });
});

//POST /lists/:listId/tasks to create a new task in a specific list
app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    //We want to create a new task in a list specified by listId

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // List object is valid therfore the currently auth user can create new tasks
            return true;
        }

        // else the list object is undefined
        return false;
    }).then((canCreateTask) => {
        if (canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    })
});

//PATCH /lists/:listId/tasks/taskId to update an existing task specified by task id
app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // List object is valid therfore the currently auth user can update tasks in specifed list
            return true;
        }

        // else the list object is undefined
        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            // The currently auth user can update tasks
            Task.findOneAndUpdate({
                _id: req.params.taskId, _listId: req.params.listId
            }, {
                $set: req.body
            }
            ).then(() => {
                res.send({ message: "Updated successfully" })
            })
        } else {
            res.sendStatus(404);
        }
    })


});

//DELETE /lists/:listId/tasks/:taskId to delete the task
app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // List object is valid therfore the currently auth user can update tasks in specifed list
            return true;
        }

        // else the list object is undefined
        return false;
    }).then((canDeleteTasks) => {

        if (canDeleteTasks) {
            Task.findOneAndRemove({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    });


});


/* USER ROUTES */

/**
 * POST /users
 * Purpose: Sign up
 */

app.post('/users', (req, res) => {
    //User sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        //  Session created successfully - refreshToken returned
        //  Now we generate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})
/**
 * POST /user/login
 * Purpose: Login
 */
app.post("/users/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    // Check if the login is for the admin user
    if (email === 'admin@test.com' && password === 'adminadmin') {
        // Create a response for admin login
        const adminResponse = {
            message: 'Admin login successful',
            isAdmin: true
        };
        return res.status(200).json(adminResponse);
    }

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Sessions created successfully - refreshToken returned
            // Now we generate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/**
 * GET /users/me/access-token
 * Purpose: Generates and returnes an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // We know that the user caller is authenticated and we have the user id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    })
})

/* ADMIN ROUTES */

// GET /admin/users to get all users (ID and email)
app.get('/admin/users', (req, res) => {
    User.find({}, '_id email')
        .then((users) => {
            res.send(users);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});


// DELETE /admin/users/:userId to delete a user by ID
app.delete('/admin/users/:userId', (req, res) => {
    const userId = req.params.userId;

    User.findByIdAndRemove(userId)
        .then((deletedUser) => {
            if (!deletedUser) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.send(deletedUser);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});


/* HELPER METHODS */

let deleteTasksFromLists = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Task from " + _listId + " where deleted");
    })
}

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});