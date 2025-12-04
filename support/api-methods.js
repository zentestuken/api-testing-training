import apiRequest from './request.js'
import { generateRegisterUserData } from './helpers.js'

export async function registerUser(email, password, username) {
  const response = await apiRequest(
    {
      path: '/users',
      method: 'POST',
      body:
        {
          user: {
            email,
            password,
            username
          }
        }
    },
    'Registering user',
    'Failed to register user',
  )
  if (response.statusCode === 200) process.env.TOKEN = response.body.user.token
  return response
}

export const getCurrentUser = () => {
  return apiRequest(
    { path: '/user' },
    'Getting current user',
    'Failed to get current user',
  )
}

export const updateCurrentUser = async (paramsToUpdate) => {
  const response = await apiRequest(
    {
      path: '/user',
      method: 'PUT',
      body: { user: paramsToUpdate }
    },
    'Updating current user',
    'Failed to update current user',
  )
  if (response.statusCode === 200) process.env.TOKEN = response.body.user.token
  return response
}

export const login = (email, password) => {
  return apiRequest(
    {
      path: '/users/login',
      method: 'POST',
      body:
        {
          user: {
            email,
            password,
          }
        }
    },
    'Logging in',
    'Failed to login',
  )
}

export const getArticles = (params) => {
  return apiRequest(
    { path: '/articles', params },
    'Getting articles',
    'Failed to get articles',
  )
}

export const getArticleBySlug = (slug) => {
  return apiRequest(
    { path: `/articles/${slug}` },
    'Getting article by slug',
    'Failed to get article by slug',
  )
}

export const createArticle = (title, description, body, tagList) => {
  return apiRequest(
    {
      path: '/articles',
      method: 'POST',
      body:
        {
          article: {
            title,
            description,
            body,
            tagList
          }
        }
    },
    'Posting an article',
    'Failed to post an article',
  )
}

export const deleteArticle = (slug) => {
  return apiRequest(
    { path: `/articles/${slug}`, method: 'DELETE' },
    'Deleting an article',
    'Failed to delete an article',
  )
}

export const registerAndLoginAsTestUser = async () => {
  const registerData = generateRegisterUserData()
  await registerUser(...Object.values(registerData))
  await login(registerData.email, registerData.password)
  return { ...registerData, token: process.env.TOKEN }
}
