import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";


// Cookies <--> Formas da gente manter contexto entre requisições

// unítarios: unidade da sua aplicação (teste)
// integração: comunicação entre duas ou mais unidades
// e2e - ponta a ponta: simulam um usuário operando na nossa aplicação

// front-end: abre a página de login, digite blablabla no campo com ID email, clique no botão
// back-end: chamada HTTP, WebSockets

// Pirâmide de testes: E2E ( não dependem de nenhuma tecnologia, não dependem de arquitetura)
//


export async function transactionsRoutes(app: FastifyInstance) {

  app.get(
    "/",
    {
    preHandler: [checkSessionIdExists],
  },
   async (req, res) => {
    const { sessionId } = req.cookies

    if(!sessionId) {
        return res.status(401).send({
            error: 'Unauthorized.',
        })
    }


    const transactions = await knex("transactions")
    .where('session_id', sessionId)
    .select()

    return { transactions }
  })

  app.get(
    "/:id",
    {
    preHandler: [checkSessionIdExists],
  }, 
  async (req) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(req.params);

    const { sessionId } = req.cookies

    const transaction = await knex("transactions")
    .where("id", id)
    .andWhere("session_id", sessionId)
    .first();

    return { transaction }
  });

  app.get(
    '/summary',
    {
    preHandler: [checkSessionIdExists],
  }, 
  async (req) => {

    const { sessionId } = req.cookies

    const summary = await knex('transactions')
    .where('session_id', sessionId)
  
    .sum('amount', {as: 'amount'})
    .first()

    return { summary }
  })

  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(req.body);

    let sessionId = req.cookies.sessionId

    if(!sessionId) {
        sessionId = randomUUID()
        
        res.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })
  
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return res.status(201).send();
  });
}
