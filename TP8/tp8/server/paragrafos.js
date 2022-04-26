var id_editar = null

function cria_para(p) {
    var editar = `<input id='editar_${p._id}' type=button class="w3-button w3-orange button_editar"  style="margin-left:20px" value="Editar"></input>`;
    var remover = `<input id='remover_${p._id}' type=button class="w3-button w3-red button_remover"  style="margin-left:10px" value="Remover"></input>`;

    $('#paragrafos').append(`<li id="para_${p._id}"> <span id="parat_${p._id}">${p.paragrafo}</span> ${editar} ${remover} </li>`)
}

$(function(){  
    $.get('http://localhost:3025/paragrafos', function(data) {
        data.forEach( p => {
            cria_para(p)
        })
    })

    $("#botao_sub").on('click',function(){
        if (id_editar!=null) {
            var id = id_editar
            id_editar = null
            data = $('#formulario').serialize()
            $.ajax({
                url: `http://localhost:3025/paragrafos/${id}`,
                type: 'PUT',
                data: data,
                success: function(result) {
                    $(`#parat_${id}`).text( $('#paragrafo').val())
                    $("#paragrafo").val('')
                }
            })
        } else {
            $.post("http://localhost:3025/paragrafos", $('#formulario').serialize(), function(result){
                cria_para(result)
                $("#paragrafo").val('')

            }) 
        }
    ;});

    $('#paragrafos').on('click', '.button_editar', function() {
        var id = (/editar\_(.+)/.exec(this.id))[1]
        $('#paragrafo').val($(`#parat_${id}`).text())
        id_editar = id
    });

    $('#paragrafos').on('click', '.button_remover', function() {
        var id = (/remover\_(.+)/.exec(this.id))[1]
        $.ajax({
            url: `http://localhost:3025/paragrafos/${id}`,
            type: 'DELETE',
            success: function(result) {
                $(`#para_${id}`).remove();
                if (id_editar == id) {
                    id_editar = null
                    $("#paragrafo").val("")
                }
            }
        });
    });
    
});
