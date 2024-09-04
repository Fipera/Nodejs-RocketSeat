import { FastifyInstance } from "fastify"
import { z } from "zod"
import { randomUUID } from "crypto"
import { knex } from "../src/database"
import { checkSessionIdExists } from "../src/middlewares/check-session-id-exists"

export async function mealRoutes(app: FastifyInstance) {

    app.post('/meals', {
        preHandler: [checkSessionIdExists],
    },
    async (request, response) => {

        const registerMealSchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            in_diet: z.boolean()
        })

        const { name, description, date, in_diet } = registerMealSchema.parse(request.body)

        await knex("meals").insert({
            id: randomUUID(),
            name,
            description,
            date,
            in_diet,
            user_id: request.user?.id
        })

        return response.status(201).send()

    })

    app.get('/meals', {
        preHandler: [checkSessionIdExists],
    },
    async (request, response) => {
        
        const meals = await knex('meals')
            .where({ user_id: request.user?.id })

            return response.send({ meals })


    })

    app.get('/meals/:id', {
        preHandler: [checkSessionIdExists],
    },
    async (request, response) => {
        
        const getMealSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealSchema.parse(request.params)

        const meal = await knex('meals').where({ id: id }).first()

        if (!meal) {
          return response.status(404).send({ error: 'Meal not found' })
        }

        return response.send({ meal })
    })



    app.put('/meals/:id', {
        preHandler: [checkSessionIdExists],
    },
    async (request, response) => {

        const getMealSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealSchema.parse(request.params)

        const meal = await knex('meals').where({ id: id }).first()

        if (!meal) {
            return response.status(404).send({ error: 'Meal not found' })
          }

          const updateMealSchema = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            date: z.string().optional(),
            in_diet: z.boolean().optional()
          })

          const { name, description, date, in_diet } = updateMealSchema.parse(request.body)

          await knex("meals")
            .where({ id })
            .update({
            name: name ?? meal.name,
            description: description ?? meal.description,
            date: date ?? meal.date,
            in_diet: in_diet ?? meal.in_diet,
        })

        return response.status(201).send({ message: 'Alteração concluída!', meal: { id, name, description, date, in_diet } })   
        
    })


    app.delete('/meals/:id', {
        preHandler: [checkSessionIdExists],
    },
    async (request, response) => {
        
        const getMealSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealSchema.parse(request.params)

        const meal = await knex('meals').where({ id: id }).first()

        if (!meal) {
          return response.status(404).send({ error: 'Meal not found' })
        }

        await knex("meals")
        .where({ id })
        .delete()

        return response.status(200).send({ message: "Refeição deletada!"})
    })

    app.get('/meals/summary', {
        preHandler: [checkSessionIdExists],
    },
    async (request, response) => {

        const userId = request.user?.id

        const totalMeals = await knex('meals')
            .where({ user_id: userId})
            .count('* as total')

        const mealsInDiet = await knex('meals')
            .where({ user_id: userId, in_diet: true})
            .count('* as inDiet')

            const mealsOutDiet = await knex('meals')
            .where({ user_id: userId, in_diet: false })
            .count('* as outDiet');


              return response.status(200).send({
                totalMeals: totalMeals[0], 
                mealsInDiet: mealsInDiet[0],
                mealsOutDiet: mealsOutDiet[0]
    });
    
  
    
        

    })



    
}