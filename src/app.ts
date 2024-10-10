import express, { Request, Response } from 'express';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Passport GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
      try {
        const existingUser = await userCollection.findOne({ githubId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = {
          githubId: profile.id,
          username: profile.username,
          email: profile._json.email || 'No public email',
        };

        const result = await userCollection.insertOne(newUser);
        const newUserWithId = await userCollection.findOne({ _id: result.insertedId });
        done(null, newUserWithId);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes

// GitHub login route
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback route
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req: Request, res: Response) => {
    res.redirect('http://localhost:5173/');
  }
);

app.get('/profile', (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(req.user);
});

// Logout route
app.get('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout error', err });
    res.json({ message: 'Logged out successfully' });
  });
});




export default app;
