const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/msx', express.static(path.join(__dirname, 'public'))); // Служим статические файлы из папки public

console.log('Starting server...');

// Simple test data
const startData = {
  "name": "MSX Player",
  "version": "1.0.0",
  "parameter": "menu:https://msx-srv.onrender.com/msx/menu.json"
};

const menuData = {
  "type": "list",
  "headline": "WALS_MSX 2.5",
  "extension": "{col:msx-white}{ico:msx-white:event} {now:date:D, M d, yyyy}{tb}{ico:msx-white:access-time} {now:time:hh:mm}",
  "dictionary": "https://wals09.github.io/msx/dictionary.json",
  "preload": "next",
  "captionUnderlay": 1,
  "underlay": {
    "items": [
      {
        "type": "space",
        "round": false,
        "layout": "0,3,12,3",
        "offset": "-1.25,-0.6,2,1.17",
        "color": "msx-black-soft"
      },
      {
        "type": "space",
        "round": false,
        "layout": "0,0,12,1",
        "offset": "-1,0,2,-0.8",
        "color": "red"
      },
      {
        "id": "text",
        "type": "space",
        "layout": "1,0,6,3",
        "offset": "-1,0.5,1,0",
        "headline": "",
        "text": ""
      }
    ]
  },
  "template": {
    "type": "default",
    "layout": "0,0,1,1",
    "area": "0,0,12,3",
    "offset": "0,2.5,0,0",
    "trigger:back": "player:stop",
    "color": "msx-glass",
    "imageFiller": "cover"
  },
  "items": [
    {
      "color": "transparent",
      "image": "https://wals09.github.io/msx/logon/getstv.png",
      "selection": {
        "important": true,
        "action": "update:content:underlay:text",
        "data": {
          "headline": "GetsTV",
          "text": "Фильмы и Мультфильмы. Крупнейшая база на любой вкус, обновляется ежедневно, новинки появляются сразу после премьеры в кинотеатре."
        }
      },
      "action": "panel:http://lg.getstv.ru/msx/msx.json",
      "properties": {
        "trigger:back": "player:stop"
      }
    }
  ]
};

// Simplified search form data
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
      "label": "Поисковый запрос:",
      "action": "input:search_query",
      "data": {
        "placeholder": "Введите название фильма или сериала..."
      }
    },
    {
      "layout": "0,2,12,1",
      "type": "space"
    },
    {
      "layout": "4,3,4,1",
      "type": "button",
      "label": "🔍 Поиск",
      "alignment": "center",
      "action": "content:request:interaction:search@https://msx-srv.onrender.com/msx/interaction/search.html?query={search_query}"
    },
    {
      "layout": "0,4,12,1",
      "type": "space"
    }
  ]
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
      '/msx/tvx-plugin.min.js',
      '/health'
    ]
  });
});

app.get('/health', (req, res) => {
  console.log('Health endpoint called');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

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

app.get('/msx/interaction/search.html', (req, res) => {
  console.log('MSX interaction search.html endpoint called');
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Search Interaction Plugin</title>
    <script src="/msx/tvx-plugin.min.js"></script>
    <script>
        (function() {
            console.log("Checking for TVXInteractionPlugin...");
            if (typeof TVXInteractionPlugin === "undefined") {
                console.error("TVXInteractionPlugin is not defined. Check if tvx-plugin.min.js loaded correctly.");
                return;
            }
            console.log("TVXInteractionPlugin type: " + typeof TVXInteractionPlugin);
            try {
                var handler = {
                    handleRequest: function(dataId, data, callback) {
                        console.log("Request received: " + dataId, data);
                        if (dataId === "init") {
                            var searchForm = ${JSON.stringify(searchFormData)};
                            console.log("Returning search form:", searchForm);
                            callback(true, searchForm);
                        } else if (dataId === "search") {
                            var query = (data && data.query) || "";
                            if (!query.trim()) {
                                var errorData = {
                                    "type": "list",
                                    "headline": "Ошибка поиска",
                                    "items": [
                                        {
                                            "title": "Пустой запрос",
                                            "description": "Пожалуйста, введите поисковый запрос"
                                        }
                                    ]
                                };
                                console.log("Returning error data:", errorData);
                                callback(true, errorData);
                            } else {
                                var resultsData = {
                                    "name": \`Результаты поиска: "\${query}"\`,
                                    "type": "list",
                                    "headline": \`Найдено для "\${query}"\`,
                                    "items": [
                                        {
                                            "title": \`Результат для "\${query}"\`,
                                            "description": "Тестовый результат поиска"
                                        }
                                    ]
                                };
                                console.log("Returning search results:", resultsData);
                                callback(true, resultsData);
                            }
                        } else {
                            console.log("Unknown request: " + dataId);
                            callback(false, "Unknown request: " + dataId);
                        }
                    }
                };

                TVXInteractionPlugin.setupHandler(handler);
                TVXInteractionPlugin.init();
            } catch (e) {
                console.error("Error initializing TVXInteractionPlugin:", e);
            }
        })();
    </script>
</head>
<body>
</body>
</html>
  `);
});

console.log('Interaction plugin route registered...');

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
