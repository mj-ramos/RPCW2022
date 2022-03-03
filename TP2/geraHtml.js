const fs = require('fs')
let jsonData = require('./cinemaATP.json')


fs.mkdirSync('filmes')
fs.mkdirSync('atores')

var actors = new Map()
var movies = new Map()
var countM = 1
var countA = 1

jsonData.forEach(register => {
    if (!movies.has(register.title)) {
        let actorsMovie = []
        let genresMovie = []

        register.cast.forEach(actor => {
            if (actors.has(actor)) {
                actors.get(actor).movies.push(register.title)
            } else {
                actors.set(actor,{id: countA, movies: [register.title]})
                countA++
            }

            actorsMovie.push(actor)
            
        })

        register.genres.forEach(genre => {
            genresMovie.push(genre)
        })

        movies.set(register.title,{id: countM, year: register.year, actors : actorsMovie, genres : genresMovie})
        countM++
    }
})

//Order movies and actors

var orderedMovies = [...movies.entries()].sort() //(a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)
var orderedActors = [...actors.entries()].sort()

//Data for html with movies
dataMovies = '<!DOCTYPE html>\n<html>\n<head><title>Movies</title><meta charset=\"UTF-8\">\n</head>' + 
    '\n<body>\n<h1>Movies</h1>\n<ul>'

//Data for html with actors
dataActors = '<!DOCTYPE html>\n<html>\n<head><title>Actors</title><meta charset=\"UTF-8\">\n</head>' +
    '\n<body>\n<h1>Actors</h1>\n<ul>'


//Html for each movie and for each actor

for (const [movie, value] of orderedMovies) {
    let data = '<!DOCTYPE html>\n<html>\n<head><title>' + movie + '</title><meta charset=\"UTF-8\">\n</head>'
        + '<body>\n<h1>' + movie +'</h1>'
        + '\n<p><b>Year:</b> ' + value.year + '</p>'
        + '\n<p><b>Cast: </b></p> \n<ul>'
    
    value.actors.forEach(actor => {
        data += '\n<li><a href=\"http://localhost:44567/atores/a' + actors.get(actor).id + '\">' + actor + '</a></li>'
    })

    data += '\n</ul>\n<p><b>Genres: </b></p> \n<ul>'

    value.genres.forEach(genre => {
        data += '\n<li>' + genre + '</li>'
    })

    data += '</ul>\n</body></html>'
    dataMovies += '\n<li><a href=\"http://localhost:44567/filmes/f' + value.id + '\">' + movie + '</a></li>'

    fs.writeFile('filmes/f' + value.id + '.html',data,(err => {
        if (err) console.log("Erro na escrita do ficheiro!")
    }))  
}


for (const [actor, value] of orderedActors) {
    let data = '<!DOCTYPE html>\n<html>\n<head><title>' + actor + '</title><meta charset=\"UTF-8\">\n</head>'
        + '<body>\n<h1>' + actor +'</h1><ul>'
    
    value.movies.forEach(movie => {
        data += '\n<li><a href=\"http://localhost:44567/filmes/f' + movies.get(movie).id + '\">' + movie + '</a></li>'
    })

    data += '</ul>\n</body></html>'
    dataActors += '\n<li><a href=\"http://localhost:44567/atores/a' + value.id + '\">' + actor + '</a></li>'


    fs.writeFile('atores/a' + value.id + '.html',data,(err => {
        if (err) console.log("Erro na escrita do ficheiro!")
    }))  
}

dataActors += '\</ul>\n</body>\n</html>'
dataMovies += '\</ul>\n</body>\n</html>'


fs.writeFile('filmes.html',dataMovies, (err) => {
    if (err) console.log("Erro na escrita do ficheiro!")
})

fs.writeFile('atores.html',dataActors, (err) => {
    if (err) console.log("Erro na escrita do ficheiro!")
})


//Construction of index.html

data = "<!DOCTYPE html>\n<html>\n<head>\n<title>cinema</title><meta charset=\"UTF-8\">\n</head>\n" +
    "<body>\n<h1>Cinema</h1>\n<p>Info about <a href=\"filmes\">movies</a></p>\n" + 
    "<p>Info about <a href=\"atores\">actors</a></p>\n" + 
    "</body></html>"

fs.writeFile("index.html",data, (err) => {     
    if (err) console.log('Erro a escrever ficheiro!')
})