const fs = require('fs')
let jsonData = require('./cinemaATP.json')
var count = 1

fs.mkdirSync('filmes')

jsonData.forEach(register => {
    let movieData = '<!DOCTYPE html>\n<html>\n<head><title>' + register.title + '</title><meta charset=\"UTF-8\">\n</head>\n'
        + '<body>\n<h1>' + register.title + '</h1>'
        + '\n<p><b>Year:</b> ' + register.year + '</p>'
        + '\n<p><b>Cast: </b></p> \n<ul>'

    register.cast.forEach(actor => {
        movieData += '\n<li>' + actor + '</li>'
    })

    movieData += '\n</ul>' + '\n<p><b>Genres: </b></p> \n<ul>'

    register.genres.forEach(genre => {
        movieData += '\n<li>' + genre + '</li>'
    })

    movieData += '\n</ul></body></html>'

    fs.writeFile('filmes/f' + count + '.html', movieData, (err) => {     
        if (err) console.log('Erro a escrever ficheiro!')
    })

    count++

})


//Construction of filmes.html
count = 1

let indexData = '<!DOCTYPE html>\n<html>\n<head><title>Movies</title><meta charset=\"UTF-8\">\n</head>\n'
    + '<body>\n<h1>Movies</h1>\n<ul>'

movies = []

jsonData.forEach(movie => {
    movies.push({title: movie.title, li: '\n<li><a href=\"http://localhost:44567/filmes/f' + count +'\">' + movie.title + '</a></li>'})
    count++
})

var orderedMovies = movies.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))


orderedMovies.forEach(element => {
    indexData += element.li
})

indexData += '\n</ul></body></html>'


fs.writeFile('filmes.html',indexData, (err) => {
    if (err) console.log("Erro na escrita do ficheiro!")
})


//Construction of index.html

data = "<!DOCTYPE html>\n<html>\n<head>\n<title>cinema</title><meta charset=\"UTF-8\">\n</head>\n" +
    "<body>\n<h1>Cinema</h1>\n<p>Informações sobre <a href=\"filmes\">filmes</a></p>\n" + 
    "<p>Informações sobre <a href=\"atores\">atores</a></p>\n" + 
    "</body></html>"

fs.writeFile("index.html",data, (err) => {     
    if (err) console.log('Erro a escrever ficheiro!')
})