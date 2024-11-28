import express, { response } from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'doomw1ngs',
    password: 'Fg2380',
    database: 'smart-brain',
  },
});

const app = express();

app.use(express.json());
app.use(cors());

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

app.post('/signin', (req, res) => {
  db.select('email', 'hash')
    .from('login')
    .where('email', '=', req.body.email)
    .then((data) => {
      bcrypt.compare(req.body.password, data[0].hash).then((isValid) => {
        if (isValid) {
          return db
            .select('*')
            .from('users')
            .where('email', '=', req.body.email)
            .then((user) => {
              res.json(user[0]);
            })
            .catch((err) => res.status(400).json('unable to get user'));
        } else {
          res.status(400).json('wrong credentials');
        }
      });
    })
    .catch((err) => res.status(400).json('wrong credentials'));
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // hashing the password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json('Error hashing password');
    }

    db.transaction((trx) => {
      trx
        .insert({
          hash: hash,
          email: email,
        })
        .into('login')
        .returning('email')
        .then((loginEmail) => {
          return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0].email,
              name: name,
              joined: new Date(),
            })
            .then((user) => {
              res.json(user[0]);
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    }).catch((err) => res.status(404).json('unable to register'));
  });
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*')
    .from('users')
    .where({
      id: id,
    })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('Not found');
      }
    })
    .catch((err) => res.status(400).json('error getting user'));
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries', 'name')
    .then((entries) => {
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json('undable to get entries'));
});

app.listen(4000, () => {
  console.log('app is running on port 4000');
});
