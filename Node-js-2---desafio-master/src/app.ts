import fastify from 'fastify'
import { userRoutes } from '../routes/users'
import cookie from '@fastify/cookie'
import { mealRoutes } from '../routes/meals'

export  const app = fastify()

app.register(cookie)

app.register(userRoutes)
app.register(mealRoutes)