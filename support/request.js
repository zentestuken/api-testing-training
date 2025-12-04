import 'dotenv/config'
import axios from 'axios'
import got from 'got'
import { request as undici } from 'undici'
import logger from './logger.js'

const apiBaseUrl = `http://${process.env.API_HOST}:${process.env.API_PORT}${process.env.API_PREFIX}`

const apiRequestAxios = async ({ path, method = 'GET', body = {}, params }) => {
  try {
    const response = await axios({
      method,
      params,
      url: `${apiBaseUrl}${path}`,
      headers: {
        Authorization: process.env.TOKEN ? `Token ${process.env.TOKEN}` : '',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      data: body,
      timeout: process.env.API_TIMEOUT || 10_000,
    })

    return {
      request: {
        path: path,
        method: method,
        body: Object.keys(body).length ? body : null,
        params: params || null,
      },
      response: {
        statusCode: response.status,
        body: response.data,
      },
    }
  } catch(error) {
    throw {
      message: error.message || 'Unknown error',
      request: {
        path: path,
        method: method,
        body: Object.keys(body).length ? body : null,
        params: params || null,
      },
      response: {
        statusCode: error.response?.status || error.code || 'Unknown',
        body: error.response?.data || null,
      },
    }
  }
}

const apiRequestGot = async ({ path, method = 'GET', body = {}, params }) => {
  const requestOptions = {
    method,
    searchParams: params,
    url: `${apiBaseUrl}${path}`,
    headers: {
      Authorization: process.env.TOKEN ? `Token ${process.env.TOKEN}` : '',
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: { request: +process.env.API_TIMEOUT || 10_000 }
  }
  if (method !== 'GET' && Object.keys(body).length > 0) {
    requestOptions.json = body
  }

  try {
    const response = await got(requestOptions)
    const parsedBody = response.body ? JSON.parse(response.body) : null

    return {
      request: {
        path: path,
        method: method,
        body: Object.keys(body).length ? body : null,
        params: params || null,
      },
      response: {
        statusCode: response.statusCode,
        body: parsedBody,
      },
    }
  } catch(error) {
    const parsedErrorBody = error.response?.body ? JSON.parse(error.response.body) : null

    throw {
      message: error.message || 'Unknown error',
      request: {
        path: path,
        method: method,
        body: Object.keys(body).length ? body : null,
        params: params || null,
      },
      response: {
        statusCode: error.response?.statusCode || 'Unknown',
        body: parsedErrorBody,
      },
    }
  }
}

const apiRequestUndici = async ({ path, method = 'GET', body = {}, params }) => {
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : ''

  const requestOptions = {
    method,
    headers: {
      Authorization: process.env.TOKEN ? `Token ${process.env.TOKEN}` : '',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    bodyTimeout: +process.env.API_TIMEOUT || 10_000,
    headersTimeout: +process.env.API_TIMEOUT || 10_000
  }

  if (method !== 'GET' && Object.keys(body).length > 0) {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await undici(`${apiBaseUrl}${path}${queryString}`, requestOptions)

    const responseBody = await response.body.text()
    const parsedBody = responseBody ? JSON.parse(responseBody) : null

    return {
      request: {
        path: path,
        method: method,
        body: Object.keys(body).length ? body : null,
        params: params || null,
      },
      response: {
        statusCode: response.statusCode,
        body: parsedBody,
      },
    }
  } catch(error) {
    throw {
      message: error.message || 'Unknown error',
      request: {
        path: path,
        method: method,
        body: Object.keys(body).length ? body : null,
        params: params || null,
      },
      response: {
        statusCode: error.statusCode || 'Unknown',
        body: null,
      },
    }
  }
}

const getBaseRequest = () => {
  const client = process.env.API_CLIENT?.toLowerCase()
  if (client === 'got') {
    return apiRequestGot
  }
  if (client === 'undici') {
    return apiRequestUndici
  }
  return apiRequestAxios
}

export default async function(callArgs, successMsg, errorMsg) {
  let callData
  const context = new Error().stack
    .split('\n')[2]
    .trim()
    .match(/at (\w+)/)[1]
  try {
    callData = await getBaseRequest()(callArgs)
    logger.info(successMsg, callData, context)
  } catch (errorData) {
    callData = errorData
    logger.error(`${errorMsg}: ${errorData.message}`, errorData, context)
  }
  return callData.response
}
