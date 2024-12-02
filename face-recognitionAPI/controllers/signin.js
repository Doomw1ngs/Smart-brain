const handleSignin = async (req, res, db, bcrypt) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json('Wrong credentials');
  }

  // Retrieve user profile from 'users' table
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (profileError) {
    return res.status(400).json('Unable to get user');
  }

  // Respond with user profile
  res.json(userProfile);
};

export default handleSignin;
