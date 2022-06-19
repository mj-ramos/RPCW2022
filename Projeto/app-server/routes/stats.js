var express = require('express');
var router = express.Router();
var axios = require('axios');
var fs = require('fs');

const api = 'http://localhost:3002/api'

router.get('/', function(req, res) {
    axios.get(api + '/recursos?token=' + req.cookies.login.token)
      .then(dados => {
        
        var data = dados.data
        var text = fs.readFileSync('./logs.txt','utf8');
        var dict = {}
        
        data.forEach((file) => {
          var name = file.file_name
          var id = file._id.toString()
    
          dict[id] = {
            id: id,
            name: name,
            downloads: 0,
            visuals: 0
          }
        })
    
        //procurar por logs de download...
        var dls = text.match(/GET \/download\/recurso\/(.+)?/g)
        dls.forEach((dl, i) => {
          let id = dl.split('/')[3].split(/\?| /)[0]
          
          if (dict[id])
            dict[id].downloads += 1
          else
            dict[id] = {
              id: id,
              name: '',
              downloads: 1,
              visuals: 0
            }
        })
    
        //procurar por logs de visualização...
        var vs = text.match(/GET \/download\/ver\/recurso\/(.+)?/g)
        vs.forEach((v, i) => {
          let id = v.split('/')[4].split(/\?| /)[0]
          
          if (dict[id])
            dict[id].visuals += 1
          else
            dict[id] = {
              id: id,
              name: '',
              downloads: 0,
              visuals: 1
            }
        })
    
        var result = {}
        if (req.query.sort && req.query.sort=='visuals'){
            result = Object.entries(dict)
                        .sort(([,a],[,b]) => (b.visuals-a.visuals))
                        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
        }
        else{
            result = Object.entries(dict)
                        .sort(([,a],[,b]) => (b.downloads-a.downloads))
                        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
        }
        
        res.render('stats', { data: result, type: 'files', login: req.cookies.login });
      })
      .catch(e => res.render('error', {error: e, message: 'Página Indisponível.'}))  
});

router.get('/sips', function(req, res) {
  axios.get(api + '/sips?token=' + req.cookies.login.token)
    .then(dados => {
      
      var data = dados.data
      var text = fs.readFileSync('./logs.txt','utf8');
      var dict = {}
      
      data.forEach((sip) => {
        var name = sip.name
        var id = sip._id.toString()
  
        dict[id] = {
          id: id,
          name: name,
          downloads: 0
        }
      })
  
      //procurar por logs de download...
      var dls = text.match(/GET \/download\/sip\/(.+)?/g)
      dls.forEach((dl, i) => {
        let id = dl.split('/')[3].split(/\?| /)[0]
        
        if (dict[id])
          dict[id].downloads += 1
        else
          dict[id] = {
            id: id,
            name: '',
            downloads: 1
          }
      })
    
      var result = Object.entries(dict)
                      .sort(([,a],[,b]) => (b.downloads-a.downloads))
                      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
      
      res.render('stats', { data: result, type: 'sips', login: req.cookies.login });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.'}))  
});

module.exports = router;