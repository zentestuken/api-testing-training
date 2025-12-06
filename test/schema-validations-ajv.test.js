import {
  registerUser,
  login,
  getCurrentUser,
  registerAndLoginAsTestUser,
  getArticles,
  createArticle,
  updateCurrentUser,
  deleteArticle,
  getArticleBySlug,
} from '../support/api-methods.js'
import {
  generateRegisterUserData,
  getRandomLetters,
  generateArticleData,
  validateSchema,
} from '../support/helpers.js'
import { ajvSchemas as Schemas } from '../support/response-schemas.js'

describe('Tests without pre-registration', () => {
  it('register a new user', async function () {
    const testUserData = generateRegisterUserData()
    const response = await registerUser(...Object.values(testUserData))
    expect(response.statusCode).to.equal(200)

    const userBody = response.body
    expect(validateSchema(Schemas.user, userBody)).to.be.true
    expect(userBody.user).toEqual(
      expect.objectContaining({
        email: testUserData.email,
        username: testUserData.username,
        token: expect.any(String),
      }),
    )
  })

  it('same user cannot be registered twice', async function () {
    const testUserData = generateRegisterUserData()
    await registerUser(...Object.values(testUserData))
    const responseDuplicate = await registerUser(...Object.values(testUserData))
    expect(responseDuplicate.statusCode).to.equal(409)

    const errorBody = responseDuplicate.body
    expect(validateSchema(Schemas.error, errorBody)).to.be.true
    expect(errorBody).to.deep.include({
      message: 'duplicate user',
    })
  })

  it('login', async function () {
    const testUserData = generateRegisterUserData()
    await registerUser(...Object.values(testUserData))
    const response = await login(testUserData.email, testUserData.password)
    expect(response.statusCode).to.equal(200)

    const userBody = response.body
    expect(validateSchema(Schemas.user, userBody)).to.be.true
    expect(userBody.user).to.deep.include({
      email: testUserData.email,
      username: testUserData.username,
    })
  })

  it('cannot login with invalid credentials', async function () {
    const response = await login('wrongemail@wrongemail.com', 'wrongpassword')
    expect(response.statusCode).to.equal(401)

    const errorBody = response.body
    expect(validateSchema(Schemas.error, errorBody)).to.be.true
    expect(errorBody).to.deep.include({
      message: 'An error has occurred',
    })
  })

  it('get all articles', async function () {
    const response = await getArticles()
    expect(response.statusCode).to.equal(200)

    const articlesData = response.body
    expect(articlesData.articles).to.have.length.greaterThan(0)

    expect(validateSchema(Schemas.articlesList, articlesData)).to.be.true
  })

  it('get articles by author', async function () {
    const allArticlesResponse = await getArticles()
    const allArticlesData = allArticlesResponse.body
    const authorUsername = allArticlesData.articles[0].author.username
    const expectedCount = allArticlesData.articles
      .filter(article => article.author.username === authorUsername).length
    const articlesByAuthorResponse = await getArticles({ author: authorUsername })

    const articlesByAuthor = articlesByAuthorResponse.body
    expect(articlesByAuthor.articles).to.have.lengthOf(expectedCount)

    expect(validateSchema(Schemas.articlesList, articlesByAuthor)).to.be.true
    articlesByAuthor.articles.forEach(article => {
      expect(article.author).to.deep.include({
        username: authorUsername,
      })
    })
  })

  it('get articles by nonexistent author', async function () {
    const authorUsername = 'nonexistent_author_' + getRandomLetters(10)
    const articlesByAuthorResponse = await getArticles({ author: authorUsername })

    const articlesByAuthor = articlesByAuthorResponse.body
    expect(validateSchema(Schemas.articlesList, articlesByAuthor)).to.be.true
    expect(articlesByAuthor.articles).to.have.lengthOf(0)
  })

  it('get articles by nonexistent tag', async function () {
    const tag = 'nonexistent_tag_' + getRandomLetters(10)
    const articlesByTagResponse = await getArticles({ tag })

    const articlesByTag = articlesByTagResponse.body
    expect(validateSchema(Schemas.articlesList, articlesByTag)).to.be.true
    expect(articlesByTag.articles).to.have.lengthOf(0)
  })
})

describe('Tests with pre-registerd user', () => {
  let testUserData

  beforeEach(async () => {
    testUserData = await registerAndLoginAsTestUser()
  })

  it('get current user data', async function () {
    const response = await getCurrentUser()
    expect(response.statusCode).to.equal(200)

    const userBody = response.body
    expect(validateSchema(Schemas.user, userBody)).to.be.true
    expect(userBody.user).to.deep.include({
      email: testUserData.email,
      username: testUserData.username,
      token: testUserData.token,
    })
  })

  it('update current user', async function () {
    const randomLetters = getRandomLetters(7)
    const updateData = {
      email: testUserData.email + randomLetters,
      username: testUserData.username + randomLetters,
      bio: 'This is my updated bio' + randomLetters,
      image: `https://example.com/updated-image-${randomLetters}.jpg`
    }
    const response = await updateCurrentUser(updateData)
    expect(response.statusCode).to.equal(200)

    const userBody = response.body
    expect(validateSchema(Schemas.user, userBody)).to.be.true
    expect(userBody.user).toEqual(
      expect.objectContaining({
        email: updateData.email,
        username: updateData.username,
        bio: updateData.bio,
        image: updateData.image,
        token: expect.any(String),
      }),
    )
    expect(userBody.user.token).to.have.length.greaterThan(0)
  })

  it('cannot update current user token', async function () {
    const randomLetters = getRandomLetters(7)
    const updateData = {
      token: randomLetters,
    }
    const response = await updateCurrentUser(updateData)
    expect(response.statusCode).to.equal(500)

    const errorBody = response.body
    expect(validateSchema(Schemas.error, errorBody)).to.be.true
    expect(errorBody).to.deep.include({
      message: 'An error has occurred',
    })
  })

  it('cannot update current user with invalid attribute name', async function () {
    const response = await updateCurrentUser({ hokage: true })
    expect(response.statusCode).to.equal(500)

    const errorBody = response.body
    expect(validateSchema(Schemas.error, errorBody)).to.be.true
    expect(errorBody).to.deep.include({
      message: 'An error has occurred',
    })
  })

  it('current user not changed when updating with no parameters', async function () {
    const response = await updateCurrentUser({})
    expect(response.statusCode).to.equal(200)

    const userBody = response.body
    expect(validateSchema(Schemas.user, userBody)).to.be.true
    expect(userBody.user).toEqual(
      expect.objectContaining({
        email: testUserData.email,
        username: testUserData.username,
        bio: testUserData.bio,
        image: testUserData.image,
        token: expect.any(String),
      }),
    )
    expect(userBody.user.token).to.have.length.greaterThan(0)
  })

  it('create article', async function () {
    const articleData = generateArticleData()
    const response = await createArticle(...Object.values(articleData))
    expect(response.statusCode).to.equal(201)

    const articleBody = response.body
    expect(validateSchema(Schemas.article, articleBody)).to.be.true
    expect(articleBody.article).toMatchObject({
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: [...articleData.tagList].sort(),
      author: expect.objectContaining({
        username: testUserData.username,
      })
    })
  })

  it('delete article', async function () {
    const articleData = generateArticleData()
    const createResponse = await createArticle(...Object.values(articleData))
    const slug = createResponse.body.article.slug

    const deleteResponse = await deleteArticle(slug)
    expect(deleteResponse.statusCode).to.equal(204)

    const getResponse = await getArticleBySlug(slug)
    expect(getResponse.statusCode).to.equal(404)
    const errorBody = getResponse.body
    expect(validateSchema(Schemas.error, errorBody)).to.be.true
    expect(errorBody).to.deep.include({
      message: 'not found',
    })
  })

  it('cannot delete nonexistent article', async function () {
    const slug = 'nonexistent-article-' + getRandomLetters(10)

    const deleteResponse = await deleteArticle(slug)
    expect(deleteResponse.statusCode).to.equal(404)
    const errorBody = deleteResponse.body
    expect(validateSchema(Schemas.error, errorBody)).to.be.true
    expect(errorBody).to.deep.include({
      message: 'not found',
    })
  })

  it('get articles by tag', async function () {
    const articleData = generateArticleData()
    const createResponse = await createArticle(...Object.values(articleData))
    const tag = createResponse.body.article.tagList[0]

    const articlesByTagResponse = await getArticles({ tag })
    expect(articlesByTagResponse.statusCode).to.equal(200)
    const articlesByTagBody = articlesByTagResponse.body
    expect(validateSchema(Schemas.articlesList, articlesByTagBody)).to.be.true
    expect(articlesByTagBody.articles).to.have.lengthOf(1)
  })
})
