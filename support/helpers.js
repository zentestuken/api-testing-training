import defaultUser from '../fixtures/user.json'
import defaultArticle from '../fixtures/article.json'

export const getRandomLetters = (length) => {
  let result = ''
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }
  return result
}

export function generateRegisterUserData() {
  const randomLetters = getRandomLetters(10)
  return {
    ...defaultUser,
    email: `user_${randomLetters}@mymail.com`,
    password: 'Yauhen12345',
    username: `user_${randomLetters}`,
  }
}

export const generateArticleData = () => {
  const randomLetters = getRandomLetters(7)
  return {
    ...defaultArticle,
    title: `Title ${randomLetters}`,
    description: `Description ${randomLetters}`,
    body: `Article body ${randomLetters}`,
    tagList: [`tagOne${randomLetters}`, `tagTwo${randomLetters}`, `tagThree${randomLetters}`]
  }
}
