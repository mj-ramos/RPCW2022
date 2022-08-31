const url = require('url')
const http = require('http')
const fs = require('fs')

http.createServer(function(req,res) {
    let path = url.parse(req.url,true).pathname
    let fileToRead = ""

    if (path == '/filmes') {
        fileToRead = "filmes.html"
    } else if(path == '/atores') {
        fileToRead = "atores.html"
    } else if (path.match(/[af]\d+/)) {
        fileToRead = "." + path + ".html"
    } else if(path=="/") {
        fileToRead = "index.html"
    } else {
        res.writeHead(404, {'Content-Type': 'charset=utf-8'})
        res.end("<p><b>Recurso não encontrado<b><p>")
    }

    console.log(fileToRead)

    if(fileToRead != "") {
        fs.readFile(fileToRead, function(err,data) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            if(err) res.write('<p>Erro na leitura do ficheiro!</p>')
            else res.write(data)

            res.end()
        })

    }
}).listen(44567)

console.log("Servidor à escuta na porta 44567")
