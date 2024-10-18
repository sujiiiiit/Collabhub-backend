import express, { Request, Response } from 'express';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';
import cors from 'cors';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173', // Update with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  })
);

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined');
}
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

const db = client.db('users');
const userCollection = db.collection('users');

// Session and Passport setup
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GitHub OAuth setup
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: `${process.env.SERVER_URL}/auth/github/callback`,
  scope: ['user:email', 'repo']
}, async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
  try {
    const email = profile.emails?.[0]?.value || 'Private';
    const existingUser = await userCollection.findOne({ githubId: profile.id });

    if (existingUser) {
      return done(null, existingUser);
    } else {
      const newUser = {
        username: profile.username,
        email,
        githubId: profile.id,
      };
      const result = await userCollection.insertOne(newUser);
      const newUserWithId = await userCollection.findOne({ _id: result.insertedId });
      return done(null, newUserWithId);
    }
  } catch (err) {
    return done(err);
  }
}));

// Routes
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/login',
  successRedirect: process.env.CLIENT_URL,
}));

app.get('/auth/user', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/auth/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

export default app;