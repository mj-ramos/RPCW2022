/*
    Module Static - to serve static resources in public folder
    Exports: 
        Bool recursoEstatico(request) - tells if someone is asking a static resource
        void serveRecursoEstatico(req, res) - returns the resource to client
*/

var fs = require('fs')

function recursoEstatico(request){
    return /\/w3.css$/.test(request.url) || 
                /\/favicon.png$/.test(request.url)
}


function serveRecursoEstatico(req, res) {
    var partes = req.url.split('/')
    var file = partes[partes.length-1]
    console.log("file: " + file)

    fs.readFile('public/' + file, (erro, dados)=>{
        if(erro){
            console.log('Erro: ficheiro não encontrado ' + erro)
            res.statusCode = 404
            res.end()
        }
        else{
            if (file == 'favicon.ico') {
                res.writeHead(200, {"Content-Type": "image/x-icon"})
            }
            else (file == 'w3.css')
                res.writeHead(200, {"Content-Type": "text/css;charset=utf-8"})
            res.end(dados)
        }
    })
}

//Exports
exports.recursoEstatico = recursoEstatico
exports.serveRecursoEstatico = serveRecursoEstatico