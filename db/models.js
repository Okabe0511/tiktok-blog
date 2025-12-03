import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Article = sequelize.define('Article', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Admin',
  },
  tags: {
    type: DataTypes.STRING, // Storing as comma-separated string for simplicity
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'published',
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  paranoid: true,
  timestamps: true,
});

const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Anonymous',
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true
});

Article.hasMany(Comment, { foreignKey: 'articleId' });
Comment.belongsTo(Article, { foreignKey: 'articleId' });

export { Article, Comment };
