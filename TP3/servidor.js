const http = require('http')
const url = require('url')
const axios = require('axios')

var endHtml = '\n</body>\n</html>'

function htmlStart(title) {
    let start = `<!DOCTYPE html>
    <html>
        <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        </head>
        <body>
    `
    return start
}

function linesInTable(register) {
    let table = ''
    let values = Object.values(register)
    values.forEach(value => {
        if (typeof(value) != 'object') {
            table += '\n<td>' + value + '</td>'
        } else {
            table += '\n<td>' + createTable(value) + '</td>'
        }
    })

    return table
}

function createTable(data) {
    let table = '<table style=\"width:100%\">\n<tr>\n'
    let fields

    if (Array.isArray(data)) {
        fields = Object.keys(data[0])
    } else {
        fields = Object.keys(data)
    }

    fields.forEach(field => {
        if (field == '#text') field='nome'
        table += '<th>' + field + '</th>'
    });

    table += '</tr>\n'

    if (Array.isArray(data)) {
        data.forEach(register => {
            table += '\n<tr>'
            table += linesInTable(register);
            table += '\n</tr>'
        }) 
    } else {
        table += '\n<tr>'
        table += linesInTable(data)
        table += '\n</tr>'
    }

    table += '</table>'
    return table
}

http.createServer(function(req,res) {
    let path = url.parse(req.url,true).path

    if (path=='/') {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.end(htmlStart('TP3') + 
            '<h1>Listagens disponíveis</h1>\n<ul>' +
            '\n<li><p><a href=\"http://localhost:4000/alunos\">Lista de alunos</a></p></li>' +
            '\n<li><p><a href=\"http://localhost:4000/cursos\">Lista de cursos</a></p></li>' +
            '\n<li><p><a href=\"http://localhost:4000/instrumentos\">Lista de instrumentos</a></p></li>' +
            '\n</ul>' + 
            endHtml)

    } else if (path=='/alunos' || path=='/cursos' || path=='/instrumentos') {
        axios.get('http://localhost:3000' + path)
            .then(resp => {
                let data = resp.data
                let table = createTable(data)
                
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.write(htmlStart(path.substring(1)))
                res.write('<style> \ntable, th, td {border: 1px solid black; border-collapse: collapse; }\n</style>') //personalizar a tabela
                res.end(table + endHtml)
            })
    } else {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
        res.end(htmlStart('Erro') + '<p><b>Página não encontrada!</b></p>' + endHtml)
    }
}).listen(4000)

console.log('Servidor à escuta na porta 4000')