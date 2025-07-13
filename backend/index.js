const express = require('express');
const app = express();

// Increase body size limit to 30mb for JSON and URL-encoded data
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true })); 