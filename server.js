const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Sample start.json content
const startData = {
  "name": "MSX Player",
  "version": "1.0.0",
  "parameter": "menu:request:interaction:init",
  "dictionary": "https://msx.benzac.de/services/dict.json",
  "pages": [
    {
      "name": "Main Menu",
      "type": "pages",
      "headline": "Welcome to MSX Player",
      "template": {
        "type": "separate",
        "layout": "0,0,2,4",
        "icon": "movie",
        "color": "msx-glass"
      },
      "items": [
        {
          "title": "Movies",
          "titleFooter": "Browse Movies",
          "selection": [
            {
              "important": true,
              "key": "enter",
              "action": "content:request:load:/msx/menu.json"
            }
          ]
        },
        {
          "title": "TV Shows",
          "titleFooter": "Browse TV Shows",
          "selection": [
            {
              "important": true,
              "key": "enter",
              "action": "info:TV Shows coming soon!"
            }
          ]
        }
      ]
    }
  ]
};

// Sample menu.json content - Search interface
const menuData = {
  "name": "Search",
  "type": "list",
  "headline": "Поиск контента",
  "template": {
    "type": "separate",
    "layout": "0,0,2,4",
    "icon": "search",
    "color": "msx-glass"
  },
  "items": [
    {
      "title": "Поиск",
      "titleFooter": "Найти фильмы и сериалы",
      "description": "Введите название для поиска контента",
      "image": "https://via.placeholder.com/300x450/4CAF50/ffffff?text=Поиск",
      "selection": [
        {
          "important": true,
          "key": "enter",
          "action": "interaction:load:request:interaction:/msx/interaction/search_form"
        }
      ]
    }
  ],
  "options": {
    "caption": {
      "text": "Используйте пульт для навигации"
    }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'MSX Player Server is running!',
    endpoints: [
      '/msx/start.json',
      '/msx/menu.json', 
      '/msx/interaction/search_form',
      '/msx/search_results?query=<search_term>',
      '/health'
    ]
  });
});

app.get('/start.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(startData);
});

// Search form data for interaction plugin
const searchFormData = {
  "type": "list",
  "focus": true,
  "headline": "Поиск контента",
  "template": {
    "type": "separate",
    "layout": "0,0,2,6",
    "color": "msx-glass"
  },
  "items": [
    {
      "layout": "0,0,12,1",
      "type": "space"
    },
    {
      "layout": "0,1,12,1",
      "type": "control",
      "control": {
        "type": "input",
        "key": "search_query",
        "label": "Поисковый запрос:",
        "placeholder": "Введите название фильма или сериала..."
      }
    },
    {
      "layout": "0,2,12,1",
      "type": "space"
    },
    {
      "layout": "0,3,12,6",
      "type": "control",
      "control": {
        "type": "keyboard",
        "target": "search_query"
      }
    },
    {
      "layout": "0,9,12,1",
      "type": "space"
    },
    {
      "layout": "4,10,4,1",
      "type": "button",
      "label": "🔍 Поиск",
      "alignment": "center",
      "selection": [
        {
          "important": true,
          "key": "enter",
          "action": "interaction:commit:request:/msx/search_results?query={search_query}"
        }
      ]
    },
    {
      "layout": "0,11,12,1",
      "type": "space"
    }
  ]
};

// Sample search results data
const getSearchResults = (query) => ({
  "name": `Результаты поиска: "${query}"`,
  "type": "list",
  "headline": `Найдено для "${query}"`,
  "template": {
    "type": "separate",
    "layout": "0,0,2,4",
    "icon": "movie",
    "color": "msx-glass"
  },
  "items": [
    {
      "title": `Результат 1 для "${query}"`,
      "titleFooter": "Драма • 2023 • 2ч 15мин",
      "description": `Фильм, соответствующий запросу "${query}". Отличный сюжет и актёрская игра.`,
      "image": "https://via.placeholder.com/300x450/2196F3/ffffff?text=Фильм+1",
      "selection": [
        {
          "important": true,
          "key": "enter",
          "action": "video:https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
        }
      ]
    },
    {
      "title": `Результат 2 для "${query}"`,
      "titleFooter": "Комедия • 2022 • 1ч 45мин", 
      "description": `Комедия по запросу "${query}". Веселый и легкий фильм для всей семьи.`,
      "image": "https://via.placeholder.com/300x450/FF9800/ffffff?text=Фильм+2",
      "selection": [
        {
          "important": true,
          "key": "enter", 
          "action": "video:https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4"
        }
      ]
    },
    {
      "title": `Результат 3 для "${query}"`,
      "titleFooter": "Боевик • 2023 • 2ч 30мин",
      "description": `Боевик, найденный по запросу "${query}". Захватывающие сцены действий.`,
      "image": "https://via.placeholder.com/300x450/4CAF50/ffffff?text=Фильм+3",
      "selection": [
        {
          "important": true,
          "key": "enter",
          "action": "video:https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4"
        }
      ]
    }
  ],
  "options": {
    "caption": {
      "text": `Показаны результаты для запроса: "${query}"`
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`MSX Player Server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- GET /msx/start.json`);
  console.log(`- GET /msx/menu.json`);
  console.log(`- GET /msx/interaction/search_form`);
  console.log(`- GET /msx/search_results?query=<search_term>`);
  console.log(`- GET /health`);
});
