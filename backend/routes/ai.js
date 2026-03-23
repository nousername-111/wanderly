const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Destinations dataset (open data)
const destinations = require('../data/destinations') || [
  {
    name: 'Bali, Indonesia',
    type: ['beach', 'culture', 'adventure'],
    minBudget: 800,
    maxBudget: 3000,
    currency: 'IDR',
    highlights: ['Rice Terraces', 'Temples', 'Surfing', 'Nightlife'],
    country: 'Indonesia'
  },
  {
    name: 'Paris, France',
    type: ['culture', 'romance', 'food'],
    minBudget: 1500,
    maxBudget: 5000,
    currency: 'EUR',
    highlights: ['Eiffel Tower', 'Louvre', 'Seine River', 'French Cuisine'],
    country: 'France'
  },
  {
    name: 'Kyoto, Japan',
    type: ['culture', 'nature', 'food'],
    minBudget: 1200,
    maxBudget: 4000,
    currency: 'JPY',
    highlights: ['Fushimi Inari', 'Arashiyama Bamboo', 'Tea Ceremony', 'Geisha Districts'],
    country: 'Japan'
  },
  {
    name: 'Queenstown, New Zealand',
    type: ['adventure', 'nature', 'outdoors'],
    minBudget: 1500,
    maxBudget: 5000,
    currency: 'NZD',
    highlights: ['Bungee Jumping', 'Fjords', 'Skiing', 'Hiking'],
    country: 'New Zealand'
  },
  {
    name: 'Santorini, Greece',
    type: ['beach', 'romance', 'culture'],
    minBudget: 1500,
    maxBudget: 6000,
    currency: 'EUR',
    highlights: ['Caldera Views', 'White Villages', 'Volcanic Beaches', 'Wine'],
    country: 'Greece'
  },
  {
    name: 'Bangkok, Thailand',
    type: ['culture', 'food', 'adventure'],
    minBudget: 600,
    maxBudget: 2500,
    currency: 'THB',
    highlights: ['Grand Palace', 'Street Food', 'Night Markets', 'Temples'],
    country: 'Thailand'
  },
  {
    name: 'Machu Picchu, Peru',
    type: ['adventure', 'culture', 'nature'],
    minBudget: 1000,
    maxBudget: 3500,
    currency: 'PEN',
    highlights: ['Inca Citadel', 'Inca Trail', 'Sacred Valley', 'Cusco'],
    country: 'Peru'
  },
  {
    name: 'Safari, Kenya',
    type: ['adventure', 'nature', 'wildlife'],
    minBudget: 2000,
    maxBudget: 7000,
    currency: 'KES',
    highlights: ['Big Five', 'Masai Mara', 'Hot Air Balloon', 'Maasai Culture'],
    country: 'Kenya'
  }
];

// Filter destinations by budget and interest
function filterDestinations(budget, interest) {
  return destinations.filter(dest => {
    const budgetMatch = budget >= dest.minBudget && budget <= dest.maxBudget * 1.2;
    const interestMatch = !interest || 
      dest.type.some(t => t.toLowerCase().includes(interest.toLowerCase())) ||
      interest.toLowerCase().includes(t => dest.type.includes(t));
    return budgetMatch || (interest && interestMatch);
  }).slice(0, 4);
}

// POST /api/ai/recommend
router.post('/recommend', async (req, res) => {
  const { budget, interest, duration, travelers, from, destination } = req.body;

  if (!budget || !interest) {
    return res.status(400).json({ error: 'Budget and interest are required.' });
  }

  try {
    // Filter relevant destinations
    const filtered = filterDestinations(Number(budget), interest);
    const destNames = filtered.map(d => d.name).join(', ');

    const prompt = `You are an expert travel planner. A user wants to travel with the following preferences:
- Budget: $${budget} USD total
- Interest: ${interest}
- Duration: ${duration || '7-10 days'}
- Number of travelers: ${travelers || 1}
- Traveling from: ${from || 'not specified'}
- Preferred destination: ${destination ? destination + ' (user specifically wants to go here — build the plan around this destination)' : 'not specified — please recommend the best destination based on budget and interests'}

Suggested destinations to consider: ${destination || destNames || 'any suitable destination'}

Generate a detailed, personalized travel plan with:
1. **Recommended Destination** - Best destination for their budget and interests
2. **Why This Destination** - 2-3 compelling reasons
3. **Itinerary** - Day-by-day breakdown (at least 5 days)
4. **Budget Breakdown** - Flights, accommodation, food, activities, miscellaneous
5. **Top Activities** - 5 must-do experiences
6. **Pro Tips** - 3 insider travel tips
7. **Best Time to Visit**
8. **Packing Essentials** - 5 key items

Format your response as a valid JSON object with these keys:
{
  "destination": "string",
  "country": "string",
  "tagline": "catchy one-liner",
  "whyVisit": ["reason1", "reason2", "reason3"],
  "itinerary": [{"day": 1, "title": "string", "activities": ["act1", "act2", "act3"]}],
  "budgetBreakdown": {"flights": number, "accommodation": number, "food": number, "activities": number, "misc": number},
  "topActivities": ["act1", "act2", "act3", "act4", "act5"],
  "proTips": ["tip1", "tip2", "tip3"],
  "bestTime": "string",
  "packingEssentials": ["item1", "item2", "item3", "item4", "item5"],
  "estimatedTotal": number
}

Return ONLY the JSON object, no markdown or extra text.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });

    const raw = completion.choices[0].message.content.trim();
    const plan = JSON.parse(raw);

    res.json({ success: true, plan });
  } catch (error) {
    console.error('AI error:', error.message);
    // Fallback mock response if OpenAI fails
    res.status(500).json({
      error: 'AI generation failed',
      message: error.message
    });
  }
});

// GET /api/ai/destinations
router.get('/destinations', (req, res) => {
  res.json({ destinations });
});

module.exports = router;
