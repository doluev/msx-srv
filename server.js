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
  "parameter": "menu:https://msx-srv.onrender.com/msx/menu.json"
};

const menuData = {
  "name": "Search Menu",
  "headline": "Поиск контента", 
  "menu": [
    {
      "type": "separator",
      "label": "Поиск"
    },
    {
      "type": "item",
      "title": "Найти контент",
      "description": "Поиск фильмов и сериалов",
      "icon": "search",
      "action": "content:request:interaction:init@https://msx-srv.onrender.com/msx/interaction/search.html"
    }
  ]
};

// Search form data for interaction plugin (now embedded in the HTML)
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
          "action": "interaction:commit:content:request:interaction:search@{query:{search_query}}"
        }
      ]
    },
    {
      "layout": "0,11,12,1",
      "type": "space"
    }
  ]
};

console.log('Extended data objects created...');

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

// Interaction plugin HTML
app.get('/msx/interaction/search.html', (req, res) => {
  console.log('MSX interaction search.html endpoint called');
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Search Interaction Plugin</title>
    <script src="//msx.benzac.de/js/tvx-plugin.min.js"></script>
    <script>
        (function() {
            var plugin = new TVXInteractionPlugin();
            plugin.Setup({
                id: "search.interaction.plugin",
                version: "1.0.0",
                name: "Search Plugin",
                description: "Handles content search",
                icon: "search"
            });

            var handler = {
                handleRequest: function(dataId, data, callback) {
                    if (dataId === "init") {
                        var searchForm = ${JSON.stringify(searchFormData)};
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
                            callback(true, resultsData);
                        }
                    } else {
                        callback(false, "Unknown request: " + dataId);
                    }
                }
            };

            plugin.setupHandler(handler);
        })();
    </script>
</head>
<body>
</body>
</html>
  `);
});

console.log('Interaction plugin route registered...');

// Remove or comment out unused endpoints if desired
// app.get('/msx/interaction/search_form', ...);
// app.get('/msx/search_results', ...);

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
