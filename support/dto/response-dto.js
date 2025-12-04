class UserResponseDTO {
  constructor(responseBody) {
    this.id = responseBody.user.id
    this.username = responseBody.user.username
    this.email = responseBody.user.email
    this.token = responseBody.user.token
    this.bio = responseBody.user.bio
    this.image = responseBody.user.image
  }
}

class ArticleResponseDTO {
  constructor(responseBody) {
    this.slug = responseBody.article.slug
    this.title = responseBody.article.title
    this.description = responseBody.article.description
    this.body = responseBody.article.body
    this.tagList = responseBody.article.tagList
    this.createdAt = responseBody.article.createdAt
    this.updatedAt = responseBody.article.updatedAt
    this.favorited = responseBody.article.favorited
    this.favoritesCount = responseBody.article.favoritesCount
    this.authorUsername = responseBody.article.author.username
    this.authorBio = responseBody.article.author.bio
    this.authorImage = responseBody.article.author.image
    this.authorFollowing = responseBody.article.author.following
  }
}

class ArticlesResponseDTO {
  constructor(responseBody) {
    this.articles = responseBody.articles.length ?
      responseBody.articles.map(article => new ArticleResponseDTO({ article })) : []
  }
}

class ErrorResponseDTO {
  constructor(responseBody) {
    this.message = responseBody.message
  }
}

export {
  UserResponseDTO,
  ArticleResponseDTO,
  ArticlesResponseDTO,
  ErrorResponseDTO,
}
