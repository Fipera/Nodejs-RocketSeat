import { FastifyReply, FastifyRequest } from "fastify"
import { knex } from "../database"

export async function checkSessionIdExists(request: FastifyRequest, response: FastifyReply) {
    request.headers
    const sessionId = request.cookies.sessionId

    if(!sessionId) {
        return response.status(401).send({
            error: 'Unauthorized1.',
        })
    }

    const user = await knex('users').where({ session_id: sessionId }).first()

  if (!user) {
    return response.status(401).send({ error: 'Unauthorized2' })
  }

  request.user = user
}