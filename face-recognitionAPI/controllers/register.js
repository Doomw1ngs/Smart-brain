const handleRegister = async (req, res, supabase) => {
  const { name, email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    return res.status(400).json('Unable to register');
  }

  // Respond with the user data
  res.json(data.user);
};

export default handleRegister;
