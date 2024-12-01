import express from 'express';
import serverless from 'serverless-http';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import db from './controllers/db.js';
import handleRegister from './controllers/register.js';
import handleSignin from './controllers/signin.js';
import handleProfile from './controllers/profile.js';
import handleImage from './controllers/image.js';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const validateUser = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

db.raw('SELECT 1')
  .then(() => console.log('database connected successfully'))
  .catch((err) => console.log('database connection failed', err));

app.post('/clarifai', async (req, res) => {
  const PAT = 'b3dcf45daa9346e895cec57b6487afcd';
  const { imageUrl } = req.body;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: 'doom_w1ngs',
      app_id: 'Face-recognition',
    },
    inputs: [
      {
        data: {
          image: {
            url: imageUrl,
          },
        },
      },
    ],
  });

  try {
    const clarifaiResponse = await fetch(
      'https://api.clarifai.com/v2/models/face-detection/outputs',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Key ${PAT}`,
        },
        body: raw,
      }
    );
    const data = await clarifaiResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json('Unable to communicate with Clarifai API');
  }
});

app.post('/signin', validateUser, (req, res) => {
  handleSignin(req, res, db, bcrypt);
});

app.post('/register', validateUser, (req, res) => {
  // console.log('register endpoint hit');
  handleRegister(req, res, bcrypt, db);
});

app.get('/profile/:id', (req, res) => {
  handleProfile(req, res, db);
});

app.put('/image', (req, res) => {
  handleImage(req, res, db);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});

export default serverless(app);
