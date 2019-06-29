var Telas = {
	atual:"#Tela_Carregando",
	trocar(telaAntiga,telaNova){
		if(!telaAntiga){
			telaAntiga = this.atual;
		}
		this.atual = telaNova;
		Pagina.elementos.animateCSS(telaNova,"fadeInUp"  )
		$(telaAntiga).css("display","none");
		$(telaNova).css("display","block");
		if(telaAntiga =="#Tela_Busca"){
			$("#Tela_Busca .sem-poemas").hide()
			$("#resultados-de-busca")[0].innerHTML =`<div id="apresentacao" class="${Pagina.configurações.modoEscuro.corDeTexto}-text container center-align"><i class="material-icons large">search</i><h4>Faça uma busca</h4></div>`;
			$("#pesquisar-tela .material-icons")[0].innerHTML="search";
			$("#pesquisar-tela").attr("onclick","Telas.trocar(null,'#Tela_Busca')");
		}
		else if(telaAntiga == "#Tela_Categorias"){
			$(".sidenav-trigger").show()
			$(".voltarButton").hide()
		}
		if(telaNova =="#Tela_Busca"){
			$("#pesquisar-tela .material-icons")[0].innerHTML="close";
			$("#pesquisar-tela").attr("onclick","Telas.trocar(null,'#Tela_Painel')");
		}
		else if(telaNova == "#Tela_Categorias"){
			this.telaDeCategorias.exibirLista()
		}
		if($(".sidenav")[0].M_Sidenav.isOpen){$(".sidenav").sidenav("close")}
	},
	async lerConfiguraçõesDeLayoutDoUsuario(){
		this.tamanhoDosElementos = "s12 m6"
		this.displayDoTexto = ""
		const documento = (await GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).get())
			if(documento.exists){
				if(documento.data().tamanhoDosElementos){this.tamanhoDosElementos = documento.data().tamanhoDosElementos}
				if(documento.data().displayDoTexto){this.displayDoTexto = documento.data().displayDoTexto}
			}
			else{
				this.salvarConfiguraçõesDeLayoutDoUsuario()
			}
	},
	salvarConfiguraçõesDeLayoutDoUsuario(){
		firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).update({
			tamanhoDosElementos: this.tamanhoDosElementos,
			displayDoTexto: this.displayDoTexto
		});
	},
	atualizarLista(nomeDaLista,array){
		var poemas = array;
		if(nomeDaLista == "lista-de-poemas") poemas = GerenciadorDePoemas.poemas;
		var html = "";
		poemas.map((poema)=>{
			if(poema.linhas.length >= 2){var primeiroParagrafo = poema.linhas[0]+"<br>"+poema.linhas[1];}
			else{var primeiroParagrafo = poema.linhas[0]}
			var corDoTexto = "white";
			if(poema.cor == "white" || poema.cor == "yellow" || poema.cor=="amber" || !poema.cor) corDoTexto = "black";
			if(!poema.cor) poema.cor = "white";
			html += `<div class="poema-card col ${Telas.tamanhoDosElementos}"><div class="card ${poema.cor} ${corDoTexto}-text"><div class="card-content waves-effect w-100" onclick="Modals.modalVisualizarPoema.abrir('${poema.id}')"><span class="card-title">${poema.titulo}</span><p class="${Telas.displayDoTexto}">${primeiroParagrafo}</p></div><div class="card-action right-align ${Telas.displayDoTexto}"><a class="btn btn-flat btn-floating ${poema.cor} ${corDoTexto}-text waves-effect circle left" onclick="Modals.modaldeletarPoema.abrir('${poema.id}')"><i class="material-icons ${corDoTexto}-text">delete</i></a><a class="btn btn-flat ${poema.cor} ${corDoTexto}-text waves-effect" onclick="Modals.modalVisualizarPoema.abrir('${poema.id}')">Abrir</a></div></div></div>`;
		});
		var pai = $(`#${nomeDaLista}`)[0].parentNode;
		var alvo = $(pai).find(".sem-poemas");
		if(html != ""){
			alvo.hide();
		}
		else{
			alvo.show();
		}
		Pagina.elementos.animateCSS(`#${nomeDaLista}`,"fadeInUp"  )
		//$(telaAntiga).css("display","none");
		$(`#${nomeDaLista}`).css("display","block");
		$(`#${nomeDaLista}`)[0].innerHTML = html;
	},
	atualizarTelas(){
		if(this.atual != "#Tela_Carregando"){
			this.atualizarLista("lista-de-poemas")
			this.telaDePesquisa.pesquisar()
			if(this.atual == "#Tela_Categorias"){
				if(this.telaDeCategorias.atualCategoriaId == null){
					this.telaDeCategorias.exibirLista()
				}
				else{
					this.telaDeCategorias.exibirCategoria(this.telaDeCategorias.atualCategoriaId)
				}
			}
		}
		//if(this.atual != "#Tela_Carregando") this.trocar(null,this.atual)
	},
	telaDePesquisa:{
		pesquisar(){
			const termoDeBusca = $("#pesquisar").val();
			if(termoDeBusca != "" && Telas.atual == "#Tela_Busca"){
				const resultadoDaBusca = GerenciadorDePoemas.pesquisarPoema(termoDeBusca)
				Telas.atualizarLista("resultados-de-busca", resultadoDaBusca);
			}
		}
	},
	telaDeCategorias:{
		exibirLista(){
			var temaEscuro = "black-text"
			if(Pagina.configurações.modoEscuro.ativado){temaEscuro = "grey darken-4 white-text"}
			$(".sidenav-trigger").show()
			$(".voltarButton").hide()
			this.atualCategoriaId = null;
			$("#lista-de-poemas-categoria").hide()
			Pagina.elementos.animateCSS("#lista-de-categorias","fadeIn"  )
			$("#lista-de-categorias").show()
			$("#Tela_Categorias .sem-poemas").hide()
			$("#Tela_Categorias .sem-categorias").hide()
			var html = `<ul class="collection with-header"><li class="collection-header ${temaEscuro}"><h5 class="valign-wrapper"><span class="material-icons">format_list_bulleted</span>&emsp;Categorias</h5></li>`
			const categorias = Object.keys(GerenciadorDePoemas.categorias);
			html += categorias.map(categoriaId=>{
				
				return  `<li class="collection-item waves-effect w-100 ${temaEscuro} row remove-1">  <div onclick="Telas.telaDeCategorias.exibirCategoria('${categoriaId}')"  class="valign-wrapper col s8 remove-2"> <span class="tiny material-icons">brightness_1</span> &emsp;${GerenciadorDePoemas.categorias[categoriaId]}</div><div class=" col s4 right-align"><a class="${temaEscuro}" onclick="Modals.modalsDeCategoria.modalCriar.abrir('${categoriaId}')" ><i class="material-icons">edit</i></a>&emsp;<a class="${temaEscuro}" onclick="Telas.telaDeCategorias.deletarCategoria('${categoriaId}')" ><i class="material-icons">delete</i></a></div></li>`
			}).join('')
			html += "</ul>"
			$("#lista-de-categorias")[0].innerHTML = html
		},
		exibirCategoria(categoriaId){
			$(".voltarButton").show()
			$(".sidenav-trigger").hide()
			this.atualCategoriaId = categoriaId
			var results = GerenciadorDePoemas.pesquisarPoema(categoriaId,["categoriaId"])
			$("#lista-de-categorias").hide()
			Pagina.elementos.animateCSS("#lista-de-poemas-categoria","fadeIn"  )
			$("#lista-de-poemas-categoria").show()
			Telas.atualizarLista("lista-de-poemas-categoria",results)
		},
		async deletarCategoria(categoriaId){
			Pagina.mensagem("Deletando Categoria")
			Pagina.mensagem("Deletar uma categoria não deleta poemas!")
			var results = GerenciadorDePoemas.pesquisarPoema(categoriaId,["categoriaId"])
			results.map(async (result)=>{
				await GerenciadorDePoemas.salvarPoema(result.id,result.titulo,result.linhas,result.cor,null,true)
			})
			await GerenciadorDePoemas.deletarCategoria(categoriaId);
			Pagina.mensagem("Categoria Deletada")
			
			Telas.atualizarTelas()
		}
	}
}