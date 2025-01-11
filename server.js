const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// OpenAI API Configuration
const openai = new OpenAI({
    apiKey: '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', // Replace with your OpenAI API key
});

// Google Maps API Key
const googleMapsApiKey = 'AIzaSyCnx7y5I2pB0Q-GUs8-MLuNzvz93zOvkOs'; // Replace with your Google Maps API key

// Generate Travel Itinerary Endpoint
app.post('/api/plan', async (req, res) => {
    try {
        const { destination, preferences, duration } = req.body;

        // Validate input
        if (!destination || !preferences || !duration) {
            return res.status(400).json({ error: 'Missing required fields: destination, preferences, or duration' });
        }

        // Use GPT-4 to generate a travel itinerary
        const openaiResponse = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant.',
                },
                {
                    role: 'user',
                    content: `Create a ${duration}-day travel itinerary for ${destination} focusing on ${preferences}.`,
                },
            ],
            model: 'gpt-3.5-turbo', // You can adjust the model as needed
        });

        if (!openaiResponse || !openaiResponse.choices || !openaiResponse.choices[0]) {
            throw new Error('Failed to generate a valid response from OpenAI');
        }

        const itinerary = openaiResponse.choices[0].message.content.trim();

        // Use Google Maps API to validate the destination
        const mapsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
            params: {
                query: destination,
                key: googleMapsApiKey,
            },
        });

        if (!mapsResponse.data || !mapsResponse.data.results || mapsResponse.data.results.length === 0) {
            throw new Error('Failed to retrieve location information from Google Maps');
        }

        const locationInfo = mapsResponse.data.results[0] || {};

        // Return response to the client
        res.json({
            itinerary,
            destinationDetails: locationInfo,
        });
    } catch (error) {
        console.error('Error generating plan:', error.message || error);
        res.status(500).json({ error: 'Failed to generate travel plan' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
