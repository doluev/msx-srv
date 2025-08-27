const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Starting server...');

// Simple test data
const startData = {
  "name": "MSX Player",
  "version": "1.0.0",
  "parameter": "menu:request:interaction:init"
};

const menuData = {
  "name": "Search",
  "type": "list",
  "headline": "Поиск контента"
};

console.log('Data objects created...');

// Routes
app.get('/', (req, res) => {
  console.log('Root endpoint called');
  res.json({
    message: 'MSX Player Server is running!',
    endpoints: [
      '/msx/start.json',
      '/msx/menu.json',
      '/health'
    ]
  });
});

app.get('/health', (req, res) => {
  console.log('Health endpoint called');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

console.log('Basic routes registered...');

// MSX endpoints
app.get('/msx/start.json', (req, res) => {
  console.log('MSX start.json endpoint called');
  res.setHeader('Content-Type', 'application/json');
  res.json(startData);
});

app.get('/msx/menu.json', (req, res) => {
  console.log('MSX menu.json endpoint called');
  res.setHeader('Content-Type', 'application/json');
  res.json(menuData);
});

console.log('MSX routes registered...');

// 404 handler
app.use((req, res) => {
  console.log('404 for path:', req.path);
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`MSX Player Server running on port ${PORT}`);
  console.log('All endpoints should be available now');
});

console.log('Server setup complete');
