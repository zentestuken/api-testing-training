import { execSync } from 'child_process'
import 'dotenv/config'

const CHECK_URL = `http://${process.env.API_HOST}:${process.env.API_PORT}${process.env.API_PREFIX}/articles`

execSync(`start-server-and-test "npm run start-server" ${CHECK_URL} "npx vitest --run"`, { stdio: 'inherit' })