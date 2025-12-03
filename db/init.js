import sequelize from './db.js';
import { Article } from './models.js';

async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync models (force: true will drop tables if they exist)
    await sequelize.sync({ force: false }); // Use force: true only for dev reset
    console.log('Database synced.');

    // Check if we have articles, if not add some
    const count = await Article.count();
    if (count === 0) {
      await Article.bulkCreate([
        {
          title: 'Hello World',
          content: 'This is the first article in our SSR blog.',
          summary: 'Welcome to the blog.',
          tags: 'intro,tech',
          status: 'published'
        },
        {
          title: 'Vue SSR Guide',
          content: 'Server-Side Rendering with Vue and Express is powerful.',
          summary: 'Learn about SSR.',
          tags: 'vue,ssr',
          status: 'published'
        },
        {
          title: 'Express Middleware',
          content: 'Understanding how middleware works in Express is crucial.',
          summary: 'Express middleware explained.',
          tags: 'express,backend',
          status: 'published'
        },
        {
          title: 'Sequelize ORM',
          content: 'Sequelize makes interacting with SQL databases easy.',
          summary: 'Intro to Sequelize.',
          tags: 'db,sql',
          status: 'published'
        },
        {
          title: 'Vite for Tooling',
          content: 'Vite is a fast build tool for modern web projects.',
          summary: 'Why use Vite?',
          tags: 'tooling,vite',
          status: 'published'
        },
        {
          title: 'Understanding Hydration',
          content: 'Hydration is the process of making static HTML interactive.',
          summary: 'What is hydration?',
          tags: 'ssr,vue',
          status: 'published'
        }
      ]);
      console.log('Dummy data added.');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

initDB();
