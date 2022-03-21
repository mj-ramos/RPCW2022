var http = require('http')
var axios = require('axios')
var static = require('./static.js')
var {parse} = require('querystring') //importa a funcionalidade parse do querystring


function paginaHtml(tPendentes, tConcluidas) {
    return  `
        <!DOCTYPE html>
            <html>
                <head>
                    <title>ToDo</title>
                    <meta charset="utf-8"/>
                    <link rel="stylesheet" href="w3.css"/>
                    <link rel="icon" href="favicon.png"/>                  
                    <style>
                        body, h1, h2, h3, h4, h5, h6 {
                            font-family: "Trebuchet MS", Tahoma, sans-serif;                        
                    </style>
                </head>

                <body>
                    <div class="w3-container w3-blue-grey">
                        <h1><i>To-do list</i></h1>
                    </div>

                    <div class="w3-container w3-margin" >
                        <div class="w3-card w3-margin">
                            <header class="w3-container w3-khaki w3-text-dark-grey">
                                <h6><b>Adicionar tarefa</b></h6>
                            </header>
                            <div class="w3-container w3-border-khaki w3-bottombar">
                                ${adTarefaForm()}
                            </div>
                        </div>
                        
                        <div class="w3-row-padding w3-margin-top" id=tarefas>
                            <div class="w3-col l6 m6 s12">
                                <div class="w3-container  w3-pale-yellow w3-center">
                                    <div class="w3-panel w3-border-yellow w3-topbar w3-bottombar w3-leftbar w3-rightbar w3-text-dark-grey">
                                        <h4><b>Por fazer</b></h4>
                                        ${tPendentes}                                  
                                    </div>   
                                </div>
                            </div>
                            <div class="w3-col l6 m6 s12">
                                <div class="w3-container w3-pale-green w3-center">
                                    <div class="w3-panel w3-border-light-green w3-topbar w3-bottombar w3-leftbar w3-rightbar w3-text-dark-grey">
                                        <h4><b>Terminado</b></h4>
                                        ${tConcluidas}      
                                    </div>
                                </div>
                            </div>
                        </div>                
                    </div>

                    <footer class="w3-container w3-blue-grey">
                        <address>2022 © Maria Ramos<address>
                    </footer>
                </body>
            </html>            
        `
}

function adTarefaForm() {
    return `
        <form class="w3-container w3-margin-top w3-margin-bottom" action="/tarefas" method="POST">
            <label class="w3-text-blue-grey"><b><i>Deadline</i></b></label>
            <input class="w3-input w3-border w3-light-grey" type="text" name="deadline">

            <label class="w3-text-blue-grey"><b>Quem</b></label>
            <input class="w3-input w3-border w3-light-grey" type="text" name="quem">

            <label class="w3-text-blue-grey"><b>Descrição</b></label>
            <input class="w3-input w3-border w3-light-grey" type="text" name="descricao">

            <label class="w3-text-blue-grey"><b>Tipo</b></label>
            <input class="w3-input w3-border w3-light-grey w3-margin-bottom" type="text" name="tipo">

            <input class="w3-button w3-round-xlarge w3-blue-grey" type="submit" value="Registar"/>
            <input class="w3-button w3-round-xlarge w3-blue-grey" type="reset" value="Limpar valores"/> 
        </form>
    `
}

function tarefasPendentes(tarefas) {
    res = ''
    tarefas.forEach(t => {
        res += `
            <div class="w3-display-container" style="padding-bottom:3%">
                <div class="w3-panel w3-amber w3-hover-text-white">
                    <b>${t.tipo}</b>: ${t.descricao}
                </div>

                <div class="w3-row ">
                    <div class="w3-col l8 m12 s12 w3-left-align w3-margin-bottom" style="padding-left:5%">
                        <b>Quem</b>: ${t.quem}
                        <br>
                        <b>Data criação</b>: ${t.dataPublicacao}
                        <br>
                        <b><i>Deadline</i></b>: ${t.deadline}
                    </div>
                    <div class="w3-col l2 m6 s6">
                        <button class="w3-button w3-round-xlarge w3-orange" onclick="document.getElementById('edit').style.display='block'">Editar</button>
                    </div>   

                    <div class="w3-col l2 m6 s6">
                        <form action="/tarefas/${t.id}/concluida" method="GET">
                        <input class="w3-button w3-round-xlarge w3-green" type="submit" value="✓"/>
                        </form>
                    </div>
                </div>
                ${editarCard(t)}
            </div>
        `        
    });

    return res
}

function editarCard(t) {
    return `
        <div id="edit" class="w3-card w3-margin w3-padding-16 w3-orange w3-display-container" style="display:none">
            <span onclick="this.parentElement.style.display='none'" class="w3-button w3-margin-bottom w3-display-topright">X</span>    
            <header><b><h5>Editar tarefa</h5></b></header>

            <form class="w3-margin-top" action="/tarefas/${t.id}/editar" method="POST">  
                    <div class="w3-container w3-padding-16 w3-sand" style="text-align: left;">
                        <label><b>Descrição</b></label>
                        <input class="w3-input  w3-margin-bottom w3-light-grey w3-animate-input" style="width:40%" type="text" name="descricao" value="${t.descricao}">

                        <label><b><i>Deadline</i></b></label>
                        <input class="w3-input  w3-margin-bottom w3-light-grey w3-animate-input" style="width:40%" type="text" name="deadline" value="${t.deadline}">

                        <label><b>Tipo</b></label>
                        <input class="w3-input w3-margin-bottom w3-light-grey w3-animate-input" style="width:40%" type="text" name="tipo" value="${t.tipo}">

                        <label><b>Quem</b></label>
                        <input class="w3-input w3-margin-bottom w3-light-grey w3-animate-input" style="width:40%" type="text" name="quem" value="${t.quem}">
                    </div>
                        <input class="w3-button w3-margin-top w3-round-xlarge w3-blue-grey" type="submit" value="Submeter"/>          
            </form>       
        </div>
    `
}

function tarefasConcluidas(tarefas) {
    res = ''
    tarefas.forEach(t => {
        res += `
            <div class="w3-display-container w3-margin-bottom" style="padding-bottom:3%">
                <div class="w3-panel w3-green w3-hover-text-white">
                    <b>${t.tipo}</b>: ${t.descricao}
                </div>
                <div class="w3-row">
                    <div class="w3-col l6 m6 s12 w3-left-align" style="padding-left:5%">
                        <b>Quem</b>: ${t.quem}
                        <br>
                        <b>Data criação</b>: ${t.dataPublicacao}
                        <br>
                        <b><i>Deadline</i></b>: ${t.deadline}
                    </div>
                    
                    <div class="w3-col l6 m6 s12">
                        <form action="/tarefas/${t.id}/apagar" method="GET">
                            <input class="w3-button w3-margin-top w3-round-xlarge w3-display-right w3-red" name="id" type="submit" value="✖"/>
                        </form>
                    </div>
                </div>
            </div>
        `
        
    });

    return res

}

function recuperaInfo(request, callback){
    if(request.headers['content-type'] =='application/x-www-form-urlencoded') {
        let body = ''
        request.on('data', bloco => {
            body += bloco.toString()
        })
        request.on('end', ()=>{
            callback(parse(body))
        })
    }
}


http.createServer(function (req,res) {
    var tPendentes, tConcluidas
    var d = new Date().toISOString().substring(0, 10)
    console.log(req.method + " " + req.url + " " + d)

    if (static.recursoEstatico(req)) {
        static.serveRecursoEstatico(req,res)
    } else {
        switch(req.method){
            case "GET":
                if (req.url == "/") {
                    axios.get("http://localhost:3000/tarefas?estado=pendente")
                        .then( response => {
                            tPendentes = tarefasPendentes(response.data)                        
                            axios.get("http://localhost:3000/tarefas?estado=concluida")
                                .then(response => {
                                    tConcluidas = tarefasConcluidas(response.data)
                                    res.writeHead(200, {"Content-type": "text/html;charset=utf-8"})
                                    res.write(paginaHtml(tPendentes,tConcluidas))
                                    res.end()
                                })
                                .catch(function(erro){
                                    res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                                    res.write("<p>Não foi possível obter a lista de tarefas...")
                                    res.end()
                                }) 
                        })
                        .catch(function(erro){
                            res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Não foi possível obter a lista de tarefas...")
                            res.end()
                        })                               
                } else if (/\/tarefas\/[0-9]+\/concluida/.test(req.url)) {
                    console.log("received request")
                    var id = (req.url).split('/')[2]

                    //É necessário ir buscar toda a tarefa ao ficheiro json, alterar o campo necessário, e voltar a colocá-la no ficheiro json
                    axios.get(`http://localhost:3000/tarefas/${id}`)
                        .then(response => {
                            tarefa = response.data
                            console.log(tarefa)
                            tarefa['estado'] = 'concluida'

                            axios.put(`http://localhost:3000/tarefas/${id}`,tarefa)
                                .then(response => {
                                    res.writeHead(303, {'Location': '/#tarefas'})
                                    res.end()
                                })
                                .catch(function(erro){
                                    res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                                    res.write("<p>Não foi possível alterar estado da tarefa...")
                                    res.end()        
                                }) 
                        })
                        .catch(function(erro){
                            res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Não foi possível alterar estado da tarefa...")
                            res.end()
                        }) 

                } else if (/\/tarefas\/[0-9]+\/apagar/.test(req.url)) {
                    var id = (req.url).split('/')[2]

                    axios.delete(`http://localhost:3000/tarefas/${id}`)
                        .then(response => {
                            res.writeHead(303, {'Location': '/#tarefas'})
                            res.end()
                        })
                        .catch(function(erro){
                            res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Não foi possível eliminar tarefa...")
                            res.end()
                        }) 
                }
            break
            case "POST":
                if (req.url == "/tarefas") {
                    recuperaInfo(req, resultado => {
                        resultado['dataPublicacao'] = d
                        resultado['estado'] = 'pendente'
                        console.log('POST de registo: ' + JSON.stringify(resultado))

                        axios.post("http://localhost:3000/tarefas", resultado)
                            .then(resp => {
                                console.log(resp.data)
                                res.writeHead(303, {'Location': '/'})
                                res.end()
                            })
                            .catch(function(erro){
                                res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                                res.write("<p>Não foi possível obter a lista de tarefas...")
                                res.end()
                            })
                    })
                } else if (/\/tarefas\/[0-9]+\/editar/.test(req.url)) {
                    recuperaInfo(req, resultado => {
                        var id = (req.url).split('/')[2]
                        resultado['estado'] = 'pendente'

                        axios.get(`http://localhost:3000/tarefas/${id}`)
                            .then(response => {
                                resultado['dataPublicacao'] = response.data['dataPublicacao']
                            
                                axios.put(`http://localhost:3000/tarefas/${id}`,resultado)
                                    .then(response => {
                                        res.writeHead(303, {'Location': '/#tarefas'})
                                        res.end()
                                    })
                                    .catch(function(erro){
                                        res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                                        res.write("<p>Não foi possível alterar tarefa...")
                                        res.end()        
                                    }) 
                            }).catch(function(erro){
                                res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                                res.write("<p>Não foi possível alterar tarefa...")
                                res.end()        
                            }) 
                    })
                }
                break
        }
    }
}).listen('7777')

console.log('Servidor à escuta na porta 7777...')