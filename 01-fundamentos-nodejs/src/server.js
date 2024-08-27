// GET => Buscar um recurso do back-end
// POST => Criar um recurso no back-end
// PUT => Atualizar um recurso no back-end
// PATCH => Atualizar um recurso especifico de um recurso no back-end
// DELETE => Deletar um recurso do back-end

// Sateful - Depende de memória para funcionar de forma correta
// Stateless - Funciona independente da memória

// Cabeçalhos (Requisição/resposta) => Metadados

// HTTP Status Code

// Query Parameters: URL Stateful => Filtros, paginação, não-obrigatórios
// Route Parameters: Identificação de recursos
// Request Body: Envio de informacções de um formulário (HTTPs)

// http://localhost:3333/users?userId=1&name=Filipe
// http://localhost:3333/users/1
// POST http://localhost:3333/users

// Edicção e Remoção



import http from 'node:http'
import { json } from './middlewares/json.js'
import { routes } from './routes.js'



const server = http.createServer(async (req, res) => {
    const { method, url} = req

    await json(req, res)

    const route = routes.find(route => { 
        return route.method === method && route.path.test(url)
    })

    if (route) {
        const routeParams = req.url.match(route.path)

        console.log(routeParams)
        
        return route.handler(req, res)
    }

    return res.writeHead(404).end()

})

server.listen(3333)