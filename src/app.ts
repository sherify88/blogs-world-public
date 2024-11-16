import express, { Application } from "express";
import postsRouter from './posts/routes/posts.route'; 
import usersRouter from './users/routes/users.route'; 
import authRouter from './auth/routes/auth.route';  
import commentsRouter from './comments/routes/comments.route';
import { json } from "body-parser";
import { connectDatabase } from "./config/sequelize.config";
import { errorHandler } from "./middlewares/errorHandler";
import passport from "./config/passport";

const app: Application = express();

// Middleware
app.use(json());

// Initialize Passport middleware
app.use(passport.initialize());



// Routes
app.use('/comments', commentsRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/auth', authRouter); 

// Connect to the database
connectDatabase();

app.use(errorHandler);

  // Start the server
const PORT = process.env.PORT || 3666;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



