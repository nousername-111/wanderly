const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// GET /api/auth/profile/:userId
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json({ success: true, profile: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile/:userId
router.put('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, phone } = req.body;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, name, phone, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, profile: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/trips/:userId
router.get('/trips/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, trips: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/trips
router.post('/trips', async (req, res) => {
  const { userId, destination, country, budget, duration, interest, plan } = req.body;

  try {
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        destination,
        country,
        budget,
        duration,
        interest,
        plan,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, trip: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/trips/:tripId
router.delete('/trips/:tripId', async (req, res) => {
  const { tripId } = req.params;

  try {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
    res.json({ success: true, message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
