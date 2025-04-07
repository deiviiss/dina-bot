import 'dotenv/config'

export const config = {
  PORT: process.env.PORT ?? 3008,
  //META
  jwtToken: process.env.JWT_TOKEN,
  numberId: process.env.NUMBER_ID,
  verifyToken: process.env.VERIFY_TOKEN,
  version: 'v20.0',
  //END META
  //AI
  apiKey: process.env.API_KEY,
  url: process.env.URL
  //END AI
}