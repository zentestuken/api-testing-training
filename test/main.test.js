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
} from '../support/helpers.js'
import {
  UserResponseDTO,
  ArticleResponseDTO,
  ArticlesResponseDTO,
  ErrorResponseDTO,
} from '../support/dto/response-dto.js'

describe('Tests without pre-registration', () => {
  it('register a new user', async function () {
    const testUserData = generateRegisterUserData()
    const response = await registerUser(...Object.values(testUserData))
    expect(response.statusCode).to.equal(200)

    const user = new UserResponseDTO(response.body)
    expect(user).toEqual(
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

    const error = new ErrorResponseDTO(responseDuplicate.body)
    expect(error).to.deep.include({
      message: 'duplicate user',
    })
  })

  it('login', async function () {
    const testUserData = generateRegisterUserData()
    await registerUser(...Object.values(testUserData))
    const response = await login(testUserData.email, testUserData.password)
    expect(response.statusCode).to.equal(200)

    const user = new UserResponseDTO(response.body)
    expect(user).to.deep.include({
      email: testUserData.email,
      username: testUserData.username,
    })
  })

  it('cannot login with invalid credentials', async function () {
    const response = await login('wrongemail@wrongemail.com', 'wrongpassword')
    expect(response.statusCode).to.equal(401)

    const error = new ErrorResponseDTO(response.body)
    expect(error).to.deep.include({
      message: 'An error has occurred',
    })
  })

  it('get all articles', async function () {
    const response = await getArticles()
    expect(response.statusCode).to.equal(200)

    const articlesData = new ArticlesResponseDTO(response.body)
    expect(articlesData.articles).to.have.length.greaterThan(0)

    const article = articlesData.articles[0]
    expect(article).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        description: expect.any(String),
        authorUsername: expect.any(String),
      }),
    )
  })

  it('get articles by author', async function () {
    const allArticlesResponse = await getArticles()
    const allArticlesData = new ArticlesResponseDTO(allArticlesResponse.body)
    const authorUsername = allArticlesData.articles[0].authorUsername
    const expectedCount = allArticlesData.articles
      .filter(article => article.authorUsername === authorUsername).length
    const articlesByAuthorResponse = await getArticles({ author: authorUsername })

    const articlesByAuthor = new ArticlesResponseDTO(articlesByAuthorResponse.body)
    expect(articlesByAuthor.articles).to.have.lengthOf(expectedCount)

    articlesByAuthor.articles.forEach(article => {
      expect(article).to.deep.include({
        authorUsername,
      })
    })
  })

  it('get articles by nonexistent author', async function () {
    const authorUsername = 'nonexistent_author_' + getRandomLetters(10)
    const articlesByAuthorResponse = await getArticles({ author: authorUsername })

    const articlesByAuthor = new ArticlesResponseDTO(articlesByAuthorResponse.body)
    expect(articlesByAuthor.articles).to.have.lengthOf(0)
  })

  it('get articles by nonexistent tag', async function () {
    const tag = 'nonexistent_tag_' + getRandomLetters(10)
    const articlesByTagResponse = await getArticles({ tag })

    const articlesByTag = new ArticlesResponseDTO(articlesByTagResponse.body)
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

    const user = new UserResponseDTO(response.body)
    expect(user).to.deep.include({
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

    const user = new UserResponseDTO(response.body)
    expect(user).toEqual(
      expect.objectContaining({
        email: updateData.email,
        username: updateData.username,
        bio: updateData.bio,
        image: updateData.image,
        token: expect.any(String),
      }),
    )
    expect(user.token).to.have.length.greaterThan(0)
  })

  it('cannot update current user token', async function () {
    const randomLetters = getRandomLetters(7)
    const updateData = {
      token: randomLetters,
    }
    const response = await updateCurrentUser(updateData)
    expect(response.statusCode).to.equal(500)

    const error = new ErrorResponseDTO(response.body)
    expect(error).to.deep.include({
      message: 'An error has occurred',
    })
  })

  it('cannot update current user with invalid attribute name', async function () {
    const response = await updateCurrentUser({ hokage: true })
    expect(response.statusCode).to.equal(500)

    const error = new ErrorResponseDTO(response.body)
    expect(error).to.deep.include({
      message: 'An error has occurred',
    })
  })

  it('current user not changed when updating with no parameters', async function () {
    const response = await updateCurrentUser({})
    expect(response.statusCode).to.equal(200)

    const user = new UserResponseDTO(response.body)
    expect(user).toEqual(
      expect.objectContaining({
        email: testUserData.email,
        username: testUserData.username,
        bio: testUserData.bio,
        image: testUserData.image,
        token: expect.any(String),
      }),
    )
    expect(user.token).to.have.length.greaterThan(0)
  })

  it('create article', async function () {
    const articleData = generateArticleData()
    const response = await createArticle(...Object.values(articleData))
    expect(response.statusCode).to.equal(201)

    const article = new ArticleResponseDTO(response.body)
    expect(article).toEqual(
      expect.objectContaining({
        title: articleData.title,
        description: articleData.description,
        body: articleData.body,
        tagList: [...articleData.tagList].sort(),
        authorUsername: testUserData.username,
      }),
    )
  })

  it('delete article', async function () {
    const articleData = generateArticleData()
    const createResponse = await createArticle(...Object.values(articleData))
    const slug = new ArticleResponseDTO(createResponse.body).slug

    const deleteResponse = await deleteArticle(slug)
    expect(deleteResponse.statusCode).to.equal(204)

    const getResponse = await getArticleBySlug(slug)
    expect(getResponse.statusCode).to.equal(404)
    const error = new ErrorResponseDTO(getResponse.body)
    expect(error).to.deep.include({
      message: 'not found',
    })
  })

  it('cannot delete nonexistent article', async function () {
    const slug = 'nonexistent-article-' + getRandomLetters(10)

    const deleteResponse = await deleteArticle(slug)
    expect(deleteResponse.statusCode).to.equal(404)
    const error = new ErrorResponseDTO(deleteResponse.body)
    expect(error).to.deep.include({
      message: 'not found',
    })
  })

  it('get articles by tag', async function () {
    const articleData = generateArticleData()
    const createResponse = await createArticle(...Object.values(articleData))
    const tag = new ArticleResponseDTO(createResponse.body).tagList[0]

    const articlesByTagResponse = await getArticles({ tag })
    expect(articlesByTagResponse.statusCode).to.equal(200)
    const articlesByTag = new ArticlesResponseDTO(articlesByTagResponse.body)
    expect(articlesByTag.articles).to.have.lengthOf(1)
  })
})
