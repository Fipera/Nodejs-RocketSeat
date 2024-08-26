import http from 'node:http'


// GET => Buscar um recurso do back-end
// POST => Criar um recurso no back-end
// PUT => Atualizar um recurso no back-end
// PATCH => Atualizar um recurso especifico de um recurso no back-end
// DELETE => Deletar um recurso do back-end

// Sateful - Depende de memória para funcionar de forma correta
// Stateless - Funciona independente da memória

// Cabeçalhos (Requisição/resposta) => Metadados

// HTTP Status Code

const users = []

const server = http.createServer((req, res) => {
    const { method, url} = req

    if(method ===  'GET' && url === '/users'){
        return res
        .setHeader('Content-Type', 'application/json')
        .end(JSON.stringify(users))
    }

    if(method === 'POST' && url === '/users'){
        users.push({
            id: 1,
            name: 'Jao Bala',
            email: 'JaoBala@gmail.com',
        })
        return res.writeHead(201).end()
        }

    return res.writeHead(404).end('Not Found')

})

server.listen(3333)