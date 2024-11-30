const handleRegister = (req, res, bcrypt, db) => {
  // console.log('request body:', req.body);
  const { name, email, password } = req.body;

  // hashing the password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json('Error hashing password');
    }
    // console.log('password hashed successfully');

    db.transaction((trx) => {
      trx
        .insert({
          hash: hash,
          email: email,
        })
        .into('login')
        .returning('email')
        .then((loginEmail) => {
          // console.log('insered into login table:', loginEmail);
          return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0].email,
              name: name,
              joined: new Date(),
            })
            .then((user) => {
              // console.log('user successfully registered:', user[0]);
              res.json(user[0]);
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    }).catch((err) => res.status(404).json('unable to register'));
  });
};

// module.exports = {
//   handleRegister: handleRegister,
// };
export default handleRegister;
