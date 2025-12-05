import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv()
addFormats(ajv)

const user = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        token: { type: 'string' },
        bio: { type: ['string', 'null'] },
        image: { type: ['string', 'null'] },
      },
      required: ['username', 'email', 'bio', 'image'],
      additionalProperties: false,
    },
  },
  required: ['user'],
  additionalProperties: false,
}

const article = {
  type: 'object',
  properties: {
    article: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        body: { type: 'string' },
        tagList: {
          type: 'array',
          items: { type: 'string' }
        },
        createdAt: {
          type: 'string',
          format: 'date-time'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time'
        },
        favorited: { type: 'boolean' },
        favoritesCount: {
          type: 'integer',
          minimum: 0
        },
        author: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            bio: { type: ['string', 'null'] },
            image: { type: ['string', 'null'] },
            following: { type: 'boolean' }
          },
          required: ['username', 'following', 'bio', 'image'],
          additionalProperties: false
        }
      },
      required: [
        'slug',
        'title',
        'description',
        'body',
        'tagList',
        'createdAt',
        'updatedAt',
        'favorited',
        'favoritesCount',
        'author'
      ],
      additionalProperties: false
    },
  },
  required: ['article'],
  additionalProperties: false,
}

const articlesList = {
  type: 'object',
  properties: {
    articles: {
      type: 'array',
      items: article.article
    },
    articlesCount: {
      type: 'integer',
      minimum: 0
    }
  },
  required: ['articles', 'articlesCount'],
  additionalProperties: false
}

const error = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    code: { type: 'string' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['message'],
  additionalProperties: false,
}

export default {
  user: ajv.compile(user),
  article: ajv.compile(article),
  articlesList: ajv.compile(articlesList),
  error: ajv.compile(error),
}
