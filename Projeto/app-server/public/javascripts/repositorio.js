$(function(){
    $('#btn_pesquisa_titulo').on('click', function() {
        $('#pesquisa_recurso')
            .attr('placeholder', 'Pesquise um título...')
            .attr('name', 'title')
    });       
    $('#btn_pesquisa_tipo').on('click', function() {
        $('#pesquisa_recurso')
            .attr('placeholder', 'Pesquise um tipo...')
            .attr('name', 'type')
    });   
    $('#btn_pesquisa_produtor').on('click', function() {
        $('#pesquisa_recurso')
            .attr('placeholder', 'Pesquise um produtor...')
            .attr('name', 'producer')
    });       
     
 
    $('#btn_pesquisa_zip').on('click', function() {
        $('#pesquisa_sip')
            .attr('placeholder', 'Pesquise um zip...')
            .attr('name', 'name')
    });       
    $('#btn_pesquisa_utilizador').on('click', function() {
        $('#pesquisa_sip')
            .attr('placeholder', 'Pesquise um utilizador...')
            .attr('name', 'user')
    });  
    $('#voltar').on('click', function() {
        location.replace(document.referrer);
    })


    var h = ($(window).height());   
    $('.content-div').css('min-height', h-90);
    
})     
