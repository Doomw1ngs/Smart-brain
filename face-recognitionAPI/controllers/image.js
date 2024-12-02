const handleImage = async (req, res, supabase) => {
  const { id } = req.body;

  try {
    // Increment the 'entries' column for the user with the specified 'id'
    const { data, error } = await supabase
      .from('users')
      .update({ entries: supabase.raw('entries + 1') })
      .eq('id', id)
      .select('entries')
      .single();

    if (error) {
      return res.status(400).json('Unable to get entries');
    }

    // Respond with the updated 'entries' count
    res.json(data.entries);
  } catch (err) {
    res.status(500).json('Error updating entries');
  }
};

export default handleImage;
