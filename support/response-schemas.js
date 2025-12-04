export const registerUser = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        token: { type: 'string' },
        bio: { type: 'string' },
        image: { type: 'string' },
      },
      required: ['username', 'token', 'email'],
      additionalProperties: false,
    },
  },
  required: ['user'],
  additionalProperties: false,
}
