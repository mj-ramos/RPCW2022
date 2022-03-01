const fs = require('fs')
let jsonData = require('./cinemaATP.json')

var actors = new Map()
var count = 1

jsonData.forEach(register => {
    register.cast.forEach(actor => {
        if (actors.has(actor)) {
            actors.get(actor).movies.push(register.title)
        } else {
            actors.set(actor,{id: count, movies: [register.title]})
            count++
        }
    })
})

fs.mkdirSync('atores')

for (const [actor, value] of actors.entries()) {
    let data = '<!DOCTYPE html>\n<html>\n<head><title>' + actor + '</title><meta charset=\"UTF-8\">\n</head>'
        + '<body>\n<h1>' + actor +'</h1><ul>'
    
    value.movies.forEach(movie => {
        data += '\n<li>' + movie + '</li>'
    })
    data += '</ul>\n</body></html>'

    fs.writeFile('atores/a' + value.id + '.html',data,(err => {
        if (err) console.log("Erro na escrita do ficheiro!")
    }))  
}

var orderedActors = [...actors.entries()].sort()
let data = '<!DOCTYPE html>\n<html>\n<head><title>Actors</title><meta charset=\"UTF-8\">\n</head>\n<body><h1>Actors</h1>\n<ul>'

orderedActors.forEach(element => {
    data += '\n<li><a href=\"http://localhost:44567/atores/a' + element[1].id + '\">' + element[0] + '</a></li>'
})

data += '\n</ul>\n</body>\n</html>'

fs.writeFile('atores.html',data,(err => {
    if (err) console.log("Erro na escrita do ficheiro!")
}))
  