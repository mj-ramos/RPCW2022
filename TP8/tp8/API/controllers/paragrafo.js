var Paragrafo = require('../models/paragrafo')

module.exports.listar = function () {
    return Paragrafo
        .find() 
        .exec()
}

module.exports.inserir = function (p) {
    var d = new Date()
    p.data = d.toISOString().substring(0,16)
    var novo = new Paragrafo(p)
    return novo.save()
}


module.exports.remover = function (id) {
    return Paragrafo
        .deleteOne({ _id: id })
        .exec()
}

module.exports.editar = function (id,para) {
    console.log(para)
    return Paragrafo
        .updateOne({_id:id},{paragrafo:para.paragrafo})
        .exec()
}