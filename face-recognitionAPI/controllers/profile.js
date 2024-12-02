const handleProfile = async (req, res, supabase) => {
  const { id } = req.params;

  try {
    // Fetch the user's profile from the 'profiles' table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(400).json('Profile not found');
    }

    // Respond with the user's profile data
    res.json(profile);
  } catch (err) {
    res.status(500).json('Error retrieving profile');
  }
};

export default handleProfile;
