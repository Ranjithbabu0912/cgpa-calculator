require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const bodyParser = require('body-parser');

const resultRoutes =
    require('./routes/resultRoutes');
const imageRoutes =
    require('./routes/imageRoutes');
const aiRoutes =
    require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(cors());

app.use(bodyParser.json());

// MongoDB
mongoose.connect(
    process.env.MONGO_URI
)
    .then(() => {

        console.log(
            'MongoDB Connected'
        );

    })
    .catch(err => {

        console.log(err);

    });

// Routes
app.use('/api', resultRoutes);
app.use('/api', imageRoutes);
app.use('/api', aiRoutes);



// Health
app.get('/api/health', (req, res) => {

    res.json({
        status: 'OK'
    });
});

// Start
const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {
    // Nodemon reload trigger comment updated for Gemini API fix
    console.log(
        `Server running on port ${PORT}`
    );

});
