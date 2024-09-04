import { FastifyInstance } from "fastify"
import { z } from "zod"
import { randomUUID } from "crypto"
import { knex } from "../src/database"


export async function userRoutes(app: FastifyInstance) {

    app.post("/register/user", async (request, response) => {

        const registerUserSchema = z.object({
            name: z.string(),
            password: z.string(),
            email: z.string()
        })

        let sessionId = request.cookies.sessionId
        
        if(!sessionId) {
            sessionId = randomUUID()

            response.cookie('sessionId', sessionId, {
                path: '/register',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })
        }

            const { name, email, password } = await registerUserSchema.parseAsync(request.body)

            const verifiyUserExists = await knex('users').where({ email }).first()

            if (verifiyUserExists) {
                return response.status(400).send("User already exists")
            }
        

            await knex("users").insert({
                id: randomUUID(),
                name,
                password,
                email,
                session_id: sessionId,
              })
          
              return response.status(201).send();
    })
}