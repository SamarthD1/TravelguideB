// backend/server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// OpenAI API Configuration
const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

// Google Maps API Key
const googleMapsApiKey = 'AIzaSyCnx7y5I2pB0Q-GUs8-MLuNzvz93zOvkOs';

// Generate Travel Itinerary Endpoint
app.post('/api/plan', async (req, res) => {
    try {
        const { destination, preferences, duration } = req.body;

        // Use GPT-4 to generate a travel itinerary
        const openaiResponse = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `Create a ${duration}-day travel itinerary for ${destination} focusing on ${preferences}.`,
            max_tokens: 500,
        });

        const itinerary = openaiResponse.data.choices[0].text.trim();

        // Use Google Maps API to validate the destination
        const mapsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
            params: {
                query: destination,
                key: googleMapsApiKey,
            },
        });

        const locationInfo = mapsResponse.data.results[0] || {};

        res.json({
            itinerary,
            destinationDetails: locationInfo,
        });
    } catch (error) {
        console.error('Error generating plan:', error);
        res.status(500).json({ error: 'Failed to generate travel plan' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
