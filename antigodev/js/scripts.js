
var Pagina = {
	iniciar(){
		try{
			var cookies = JSON.parse(document.cookie)
			if(cookies.escuro){this.temaEscuro.ativar()}
		}
		catch(e){}
		M.AutoInit();
		$(".dropdown-trigger").dropdown({ hover: false, constrainWidth: false});
		this.elementos.pesquisarTextField();
		this.elementos.temaCheckBox()
		this.elementos.logoAnimation();
		this.telas.telaDeCarregamento();
		GerenteDeAutenticacao.iniciar();
	},
	modals:{
		criar:{
			abrir(id){
				if(id && id != "null"){
					var poema = GerenciadorDePoemas.obterPoema(id);
					var titulo = poema.titulo
					var conteudo = poema.linhas.join("\n")
					this.cor = poema.cor
					this.categoriaId = poema.categoriaId
				}
				else{
					var titulo = null
					var conteudo = null
					this.cor = "white"
					this.categoriaId = null
				}
				this.alterarCategoria()
				$("#criar-modal #categoria-botao").attr("onclick",`Pagina.modals.categoria.abrir(null)`);
				$("#poema-modal").modal("close")
				$("#criar-modal #editar-titulo-poema").val(titulo);
				$("#criar-modal #editar-conteudo-poema").val(conteudo);
				$("#criar-modal #cor-botao span").attr("class",`right ${this.cor} transparent-text circle`);
				$("#criar-modal #cor-botao").attr("onclick",`Pagina.modals.cor.abrir('null')`);
				Pagina.elementos.atualizarTextField();
				$("#criar-modal form").attr("action",`javascript:Pagina.modals.criar.salvarPoema('${id}')`);
				$("#criar-modal").modal("open");
			},
			paste(){
				try{
					var cookies = JSON.parse(document.cookie)
					if(!cookies.paste){Pagina.modals.clean.openPost("area-de-transferencia")}
					cookies.paste=true;
					document.cookie = JSON.stringify(cookies)
				}
				catch(e){
					var cookies = {}
					cookies.paste=true;
					Pagina.modals.clean.openPost("area-de-transferencia")
					document.cookie = JSON.stringify(cookies)
				}
				navigator.clipboard.readText().then(text=>{
					const array = text.split("\n")
					var titulo = null
					var conteudo = null
					console.log(array)
					if(array.length == 1){
						titulo = array[0]
					}
					else if(array[1] == "" && array[0] != ""){
						titulo = array[0]
						conteudo = array.slice(2,array.lengh).join("\n")
					}
					else{
						conteudo = array.join("\n")
					}
					if(titulo){$("#criar-modal #editar-titulo-poema").val(titulo)}
					if(conteudo){$("#criar-modal #editar-conteudo-poema").val(conteudo)}
					Pagina.elementos.atualizarTextField();
				}).catch(error=>{
					if(error.message == "Read permission denied."){Pagina.mensagem("Permisāo da area de transferência bloqueada","Pagina.modals.clean.openPost('area-de-transferencia-bloqueada')")}
					else{Pagina.mensagem("Erro desconhecido")}
				})
			},
			alterarCategoria(categoriaId){
				if(!categoriaId){categoriaId = this.categoriaId}
				else{this.categoriaId = categoriaId}
				if(categoriaId){
					const nomeDaCategoria = GerenciadorDePoemas.categorias[categoriaId]
					$("#criar-modal #categoria-botao span")[0].innerHTML = nomeDaCategoria
				}
				else{$("#criar-modal #categoria-botao span")[0].innerHTML = ""}
			},
			alterarCor(cor){
				this.cor = cor;
				$("#criar-modal #cor-botao span").attr("class",`right ${cor} transparent-text circle`);
				$("#cor-modal").modal("close")
			},
			async salvarPoema(id){
				if(id=="null")id=null
				const titulo = $("#criar-modal #editar-titulo-poema").val();
				const conteudo = $("#criar-modal #editar-conteudo-poema").val().split("\n");
				const cor = this.cor
				await GerenciadorDePoemas.salvarPoema(id,titulo,conteudo,cor,this.categoriaId);
				Pagina.telas.atualizarLista("lista-de-poemas");
				Pagina.telas.pesquisar()
				if(Pagina.telas.atual == "#Tela_Categorias" && Pagina.telas.atualCategoriaId != null){
					Pagina.telas.categoriaItem(Pagina.telas.atualCategoriaId)
				}
				$("#criar-modal").modal("close")
				$("#qtd_poemas")[0].innerHTML = GerenciadorDePoemas.poemas.length;
			}
		},
		cor:{
			abrir(id){
				if(!id)id=null
				this.configurarQuadroDeCores(id)
				$("#cor-modal").modal("open");
			},
			configurarQuadroDeCores(id){
				$("#cor-modal a").map(numero=>{
					const cor = $("#cor-modal a")[numero].classList[1]
					if(id != "null" ){$($("#cor-modal a")[numero]).attr("onclick",`Pagina.modals.cor.alterarCor("${id}","${cor}")`)}
					else{$($("#cor-modal a")[numero]).attr("onclick",`Pagina.modals.criar.alterarCor("${cor}")`)}
				})
			},
			async alterarCor(id,cor){
				const poema = GerenciadorDePoemas.obterPoema(id);
				await GerenciadorDePoemas.salvarPoema(id,poema.titulo,poema.linhas,cor,poema.categoriaId);
				$("#cor-modal").modal("close");
				Pagina.modals.poema.alterarCor(cor)
				Pagina.telas.pesquisar()
				Pagina.telas.atualizarLista("lista-de-poemas");
				if(Pagina.telas.atual == "#Tela_Categorias" && Pagina.telas.atualCategoriaId != null){
					Pagina.telas.categoriaItem(Pagina.telas.atualCategoriaId)
				}
			}
		},
		categoria:{
			ativado:false,
			abrir(id){
				this.atualizarLista()
				this.id = id
				if(this.ativado != true){this.ativado=true; this.select()}
				$("#categoria-modal").modal("open")
			},
			select(){
				this.ativado=true
				$("select").on('change',Pagina.modals.categoria.alterarCategoria)
			},
			atualizarLista(){
				const categorias = Object.keys(GerenciadorDePoemas.categorias);
				const html = '<option value="" disabled selected>Selecione um:</option>' + categorias.map(id=>{
					return `<option value="${id}">${GerenciadorDePoemas.categorias[id]}</option>`
				}).join('')
				$("select")[0].innerHTML = html
			},
			async alterarCategoria(){
				var idDaCategoria = $("select").val()
				const id = Pagina.modals.categoria.id
				if(id){
					const poema = GerenciadorDePoemas.obterPoema(id)
					await GerenciadorDePoemas.salvarPoema(id,poema.titulo,poema.linhas,poema.cor,idDaCategoria)
					Pagina.modals.poema.alterarCategoria(idDaCategoria)
				}
				else{
					Pagina.modals.criar.alterarCategoria(idDaCategoria)
				}
				if(Pagina.telas.atual == "#Tela_Categorias" && Pagina.telas.atualCategoriaId != null){
					Pagina.telas.categoriaItem(Pagina.telas.atualCategoriaId)
				}
				$("#categoria-modal").modal("close")
			},
			criar:{
				abrir(id){
					if(id){
						$("#criar-categoria-modal #nome-categoria").val((GerenciadorDePoemas.categorias[id]))
					}
					else{
						$("#criar-categoria-modal #nome-categoria").val(null)
					}
					Pagina.elementos.atualizarTextField();
					$("#criar-categoria-modal form").attr("action",`javascript:Pagina.modals.categoria.criar.salvar('${id}')`)
					$("#criar-categoria-modal").modal("open")
				},
				async salvar(id){
					if(id == "null")id=null;
					var nome = $("#criar-categoria-modal #nome-categoria").val()
					await GerenciadorDePoemas.criarCategoria(id,nome)
					Pagina.modals.categoria.atualizarLista()
					if(Pagina.telas.atual == "#Tela_Categorias" && Pagina.telas.atualCategoriaId == null){
						Pagina.telas.categoriaLista()
					}
					$("#criar-categoria-modal").modal("close")
				}
			}
		},
		deletar:{
			abrir(id){
				$("#poema-modal").modal("close")
				$("#deletar-modal #deletar").attr("onclick",`Pagina.modals.deletar.deletar('${id}')`);
				$("#deletar-modal").modal("open");
			},
			async deletar(id){
				await GerenciadorDePoemas.deletarPoema(id);
				Pagina.telas.atualizarLista("lista-de-poemas");
				Pagina.telas.pesquisar();
				if(Pagina.telas.atual == "#Tela_Categorias" && Pagina.telas.atualCategoriaId != null){
					Pagina.telas.categoriaItem(Pagina.telas.atualCategoriaId)
				}
				$("#deletar-modal").modal("close")
				$("#qtd_poemas")[0].innerHTML = GerenciadorDePoemas.poemas.length;
			}
		},
		poema:{
			abrir(id){
				const poema = GerenciadorDePoemas.obterPoema(id);
				this.alterarCor(poema.cor);
				this.alterarTituloEConteudo(poema.titulo,poema.linhas);
				this.alterarBotao(id);
				this.alterarCategoria(poema.categoriaId);
				$("#poema-modal").modal("open");
			},
			alterarCategoria(categoriaId){
				if(categoriaId){
					const nomeDaCategoria = GerenciadorDePoemas.categorias[categoriaId]
					$("#poema-modal #categoria-botao span")[0].innerHTML = nomeDaCategoria
				}
				else{$("#poema-modal #categoria-botao span")[0].innerHTML = ""}
			},
			copy(id){
				const poema = GerenciadorDePoemas.obterPoema(id);
				const texto = poema.titulo + "\n\n" + poema.linhas.join("\n")
				navigator.clipboard.writeText(texto).then(()=>{
					Pagina.mensagem("Copiado")
				}).catch(error=>{
					if(error.message == "Read permission denied."){Pagina.mensagem("Permisāo da area de transferência bloqueada","Pagina.modals.clean.openPost('area-de-transferencia-bloqueada')")}
					else{Pagina.mensagem("Erro desconhecido")}
				})
			},
			alterarCor(cor){
				var corDoTexto = "white";
				if(!cor) cor = "white";
				if(cor == "white" || cor == "yellow" || cor=="amber") corDoTexto = "black";
				$("#poema-modal").attr("class", `modal ${cor} ${corDoTexto}-text`);
				$("#poema-modal ul").attr("class", `${cor} dropdown-content`);
				$("#poema-modal ul li").attr("class",`${cor}`)
				$("#poema-modal ul li a").attr("class",`${cor} waves-effect`)
				$("#poema-modal .modal-footer").attr("class",`modal-footer right-align ${cor}`);
				$("#poema-modal .modal-footer a").removeClass(`white-text`);
				$("#poema-modal .modal-footer a").removeClass(`black-text`);
				$("#poema-modal .modal-footer a").addClass(`${corDoTexto}-text`);
			},
			alterarTituloEConteudo(titulo,conteudo){
				$("#poema-modal h5")[0].innerHTML = titulo;
				const texto = conteudo.join("<br>");
				$("#poema-modal p")[0].innerHTML = texto;
			},
			alterarBotao(id){
				$("#poema-modal #copy").attr("onclick",`Pagina.modals.poema.copy('${id}')`);
				$("#poema-modal #cor-botao").attr("onclick",`Pagina.modals.cor.abrir('${id}')`);
				$("#poema-modal #categoria-botao").attr("onclick",`Pagina.modals.categoria.abrir('${id}')`);
				$("#poema-modal #delete-botao").attr("onclick",`Pagina.modals.deletar.abrir('${id}')`);
				$("#poema-modal #editar-botao").attr("onclick",`Pagina.modals.criar.abrir('${id}')`);
			}
		},
		clean:{
			abrir(opcoes){
			if(opcoes.titulo || opcoes.conteudo)this.definirContent(opcoes.titulo,opcoes.conteudo)
			this.definirFooter(opcoes.footer)
			$("#clean-modal").modal("open");
			},
			async openPost(postName){
				Pagina.mensagem("Arguarde um pouco")
				var documento = (await GerenciadorDePoemas.db.doc(`/posts/${postName}`).get())
				if(documento.exists){
					var opcoes = {}
					opcoes.titulo = documento.data().titulo
					if(!documento.data().html){
						var converter = new showdown.Converter()
						opcoes.conteudo = converter.makeHtml(documento.data().markdown);
					}
					else{opcoes.conteudo = documento.data().html}
					this.abrir(opcoes)
				}else{
					Pagina.mensagem("Post nāo encontrado")
				}
			},
			definirContent(title,conteudo){
				$("#clean-modal .modal-content h5")[0].innerHTML = title
				$("#clean-modal .modal-content #conteudo")[0].innerHTML = conteudo
			},
			definirFooter(footerElements){
				if(footerElements){
					$("#clean-modal .modal-footer")[0].innerHTML = footerElements
				}else{
					$("#clean-modal .modal-footer")[0].innerHTML = '<a class="btn waves-effect green modal-close">Cancelar</a>'
				}
			}
		}
	},
	login(usuario){
		if(usuario){
			if(usuario.photoURL){
				$(".card-img img").attr("src",`${usuario.photoURL}?type=large`);
			}
			$("#user_name")[0].innerHTML = usuario.displayName;
			$(".logado").show();
			Pagina.telas.trocar(null,"#Tela_Painel");
		}
		else{
			$(".card-img img").attr("src","");
			$("#user_name")[0].innerHTML = "Seja Bem-vindo";
			$(".logado").hide();
			Pagina.telas.trocar(null,"#Tela_Home");
		}
	},
	mensagem(texto,action){
		if(action){
			var  html= `<span>${texto}</span><button class=" red-text btn-flat" onclick="${action}">Ajuda</button>`
			
		}else{
			var html = texto
		}
		M.Toast.dismissAll();
		M.toast({html,displayLength:1500});
	},
	temaEscuro:{
		elementosDeFundo:["body", ".sidenav", ".sidenav .card",".sidenav .collapsible .collapsible-header", "#criar-modal", "#criar-modal .modal-footer","#deletar-modal","#deletar-modal .modal-footer", "#cor-modal","#more2","#categoria-modal","#Tela_Categorias ul","#Tela_Categorias ul li","select","#criar-categoria-modal","#criar-categoria-modal .modal-footer","#clean-modal","#clean-modal .modal-footer"],
		elementosDeTexto:[".sem-poemas" , "#Tela_Busca #apresentacao", ".input-field input", ".sidenav", "#criar-modal","#deletar-modal", "textarea","#cor-modal","#more2 a","#criar-modal .modal-footer .btn-flat","#categoria-modal h5","#Tela_Categorias ul li","select","#criar-categoria-modal","#clean-modal","#clean-modal .modal-content"],
		ativado:false,
		async iniciar(){
			await this.lerConfiguracaoDoUsuario()
		},
		async lerConfiguracaoDoUsuario(){
			const documento = (await GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).get())
			if(documento.exists){
				if(documento.data().temaEscuro)this.ativar();
				else this.desativar();
			}
			else{
				firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).set({
					temaEscuro:this.ativado
				});
			}
		},
		salvarConfiguracaoDoUsuario(){
			firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).get().then(documento=>{
				if(documento.exists){
					firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).update({
						temaEscuro:Pagina.temaEscuro.ativado
					});
				}
				else{
					firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).set({
						temaEscuro:Pagina.temaEscuro.ativado
					});
				}
			})
			
		},
		ativar(){
			$("#tema").prop("checked",true);
			try{var cookies = JSON.parse(document.cookie)}
			catch(e){var cookies = {}}
			cookies.escuro=true;
			document.cookie = JSON.stringify(cookies)
			this.ativado = true;
			this.corDeTexto="white"
			$(this.elementosDeFundo.join(",")).addClass("grey darken-4");
			$(this.elementosDeTexto.join(",")).addClass("white-text");
			if(Pagina.telas.atual =="#Tela_Categorias" && Pagina.telas.atualCategoriaId == null){
				Pagina.telas.categoriaLista()
			}

		},
		desativar(){
			$("#tema").prop("checked",false);
			try{var cookies = JSON.parse(document.cookie)}
			catch(e){var cookies = {}}
			cookies.escuro=false;
			document.cookie = JSON.stringify(cookies)
			this.ativado = false;
			this.corDeTexto="black"
			$(this.elementosDeFundo.join(",")).removeClass("grey darken-4");
			$(this.elementosDeTexto.join(",")).removeClass("white-text");
			if(Pagina.telas.atual == "#Tela_Categorias" && Pagina.telas.atualCategoriaId == null){
				Pagina.telas.categoriaLista()
			}
		},
		alterarTema(ativar){
			Pagina.mensagem("Alterando Tema")
			if(ativar)this.ativar();
			else this.desativar();
			this.salvarConfiguracaoDoUsuario();
		}
	},
	elementos:{
		atualizarTextField(){
			M.updateTextFields();
			M.textareaAutoResize($('#editar-conteudo-poema'))
		},
		logoAnimation(){
			setTimeout(()=>{
				$("#autoHide").animate({
					opacity: 0,
				},{
					duration:200,
					complete: function(){
						$("#autoHide").hide({duration:1000})
					}
				})
			},2000)
		},
		pesquisarTextField(){
			$("#pesquisar").on("keyup",(e)=>{
				Pagina.telas.pesquisar()
			})
		},
		temaCheckBox(){
			$("#tema").click(()=>{
				Pagina.temaEscuro.alterarTema($("#tema").prop("checked"))
			})
			$("#notification").click(async ()=>{
				if(typeof Notification != "undefined"){
					await Notificacoes.checkBoxChange()
				}else{
					Notificacoes.checkBox(false)
					Pagina.mensagem("Seu Navegador não suporta notificações")
				}
			})
		}
	},
	eventos:{
		onresize(funcao){
			window.addEventListener("resize",funcao,false);
		}
	},
	telas:{
		atual:"#Tela_Carregando",
		trocar(telaAntiga,telaNova){
			if(!telaAntiga){
				telaAntiga = this.atual;
			}
			this.atual = telaNova;
			$(telaAntiga).css("display","none");
			$(telaNova).css("display","block");
			if(telaAntiga == "#Tela_Carregando"){
				Pagina.eventos.onresize(null);
			}
			else if(telaAntiga =="#Tela_Busca"){
				$("#Tela_Busca .sem-poemas").hide()
				$("#resultados-de-busca")[0].innerHTML =`<div id="apresentacao" class="${Pagina.temaEscuro.corDeTexto}-text container center-align"><i class="material-icons large">search</i><h4>Faça uma busca</h4></div>`;
				$("#pesquisar-tela .material-icons")[0].innerHTML="search";
				$("#pesquisar-tela").attr("onclick","Pagina.telas.trocar(null,'#Tela_Busca')");
			}
			else if(telaAntiga == "#Tela_Categorias"){
				$(".sidenav-trigger").show()
				$(".voltarButton").hide()
				
			}
			if(telaNova == "#Tela_Carregando"){
				$(".mdl-layout-title")[0].innerHTML = "Carregando";
				this.telaDeCarregamento();
				Pagina.eventos.onresize(this.telaDeCarregamento);
			}
			else if(telaNova =="#Tela_Busca"){
				$("#pesquisar-tela .material-icons")[0].innerHTML="close";
				$("#pesquisar-tela").attr("onclick","Pagina.telas.trocar(null,'#Tela_Painel')");
			}
			else if(telaNova == "#Tela_Categorias"){
				this.categoriaLista()
			}
		},
		pesquisar(){
			const termoDeBusca = $("#pesquisar").val();
			if(termoDeBusca != "" && this.atual == "#Tela_Busca"){
				const resultadoDaBusca = GerenciadorDePoemas.pesquisarPoema(termoDeBusca)
				this.atualizarLista("resultados-de-busca", resultadoDaBusca);
			}
		},
		telaDeCarregamento(){
			const top = ($(document).height() - $(".nav-wrapper").height() - $(".preloader-wrapper").height())/2;
			$(".preloader-wrapper").css("margin-top",top);
			const left = ($("body").width() - $(".preloader-wrapper").width())/2;
			$(".preloader-wrapper").css("left",left);
			Pagina.eventos.onresize(this.telaDeCarregamento);
		},
		atualizarLista(nomeDaLista,array){
			var poemas = array;
			if(nomeDaLista == "lista-de-poemas") poemas = GerenciadorDePoemas.poemas;
			var html = "";
			poemas.map((poema)=>{
				if(poema.linhas.length >= 2){var primeiroParagrafo = poema.linhas[0]+"<br>"+poema.linhas[1];}
				else{var primeiroParagrafo = poema.linhas[0]}

				var colorText = "white";
				if(poema.cor == "white" || poema.cor == "yellow" || poema.cor=="amber" || !poema.cor) colorText = "black";
				if(!poema.cor) poema.cor = "white";
				html += `<div class="col s12 m6"><div class="card ${poema.cor} ${colorText}-text"><div class="card-content"><span class="card-title">${poema.titulo}</span><p>${primeiroParagrafo}</p></div><div class="card-action right-align"><a class="btn btn-flat ${poema.cor} ${colorText}-text waves-effect" onclick="Pagina.modals.poema.abrir('${poema.id}')">Abrir</a></div></div></div>`;
			});
			var pai = $(`#${nomeDaLista}`)[0].parentNode;
			var alvo = $(pai).find(".sem-poemas");
			if(html != ""){
				alvo.hide();
			}
			else{
				alvo.show();
			}
			$(`#${nomeDaLista}`)[0].innerHTML = html;
		},
		categoriaLista(){
			var temaEscuro = "black-text"
			if(Pagina.temaEscuro.ativado){temaEscuro = "grey darken-4 white-text"}
			$(".sidenav-trigger").show()
			$(".voltarButton").hide()
			this.atualCategoriaId = null;
			$("#lista-de-poemas-categoria").hide()
			$("#lista-de-categorias").show()
			$("#Tela_Categorias .sem-poemas").hide()
			$("#Tela_Categorias .sem-categorias").hide()
			var html = `<ul class="collection with-header"><li class="collection-header ${temaEscuro}"><h5 class="valign-wrapper"><span class="material-icons">format_list_bulleted</span>&emsp;Categorias</h5></li>`
			const categorias = Object.keys(GerenciadorDePoemas.categorias);
			html += categorias.map(categoriaId=>{
				
				return  `<li class="collection-item waves-effect w-100 ${temaEscuro} row remove-1">  <div onclick="Pagina.telas.categoriaItem('${categoriaId}')"  class="valign-wrapper col s8 remove-2"> <span class="tiny material-icons">brightness_1</span> &emsp;${GerenciadorDePoemas.categorias[categoriaId]}</div><div class=" col s4 right-align"><a class="${temaEscuro}" onclick="Pagina.modals.categoria.criar.abrir('${categoriaId}')" ><i class="material-icons">edit</i></a>&emsp;<a class="${temaEscuro}" onclick="Pagina.telas.categoriaDelete('${categoriaId}')" ><i class="material-icons">delete</i></a></div></li>`
			}).join('')
			html += "</ul>"
			$("#lista-de-categorias")[0].innerHTML = html
		},
		categoriaItem(categoriaId){
			$(".voltarButton").show()
			$(".sidenav-trigger").hide()
			this.atualCategoriaId = categoriaId
			var results = GerenciadorDePoemas.pesquisarPoema(categoriaId,["categoriaId"])
			$("#lista-de-categorias").hide()
			$("#lista-de-poemas-categoria").show()
			this.atualizarLista("lista-de-poemas-categoria",results)
		},
		async categoriaDelete(categoriaId){
			Pagina.mensagem("Deletando Categoria")
			Pagina.mensagem("Deletar uma categoria não deleta poemas!")
			var results = GerenciadorDePoemas.pesquisarPoema(categoriaId,["categoriaId"])
			results.map(async (result)=>{
				await GerenciadorDePoemas.salvarPoema(result.id,result.titulo,result.linhas,result.cor,null,true)
			})
			await GerenciadorDePoemas.deletarCategoria(categoriaId);
			Pagina.mensagem("Categoria Deletada")
			
			Pagina.telas.categoriaLista()
		}
	},
	urlSystem(){
		var url = new URL(window.location.href);
		var modo = url.searchParams.get("mode");
		if(modo == "clean_modal"){
			var post = url.searchParams.get("post");
			if(post){
				this.modals.clean.openPost(post)
			}
		}
		else if(modo == "poema"){
			var id = url.searchParams.get("id");
			if(id){Pagina.modals.poema.abrir(id)}
		}
		else if(modo == "criar"){
			var id = url.searchParams.get("id");
			Pagina.modals.criar.abrir(id)
		}
		else if(modo == "pwa"){
			
		}
	}
}
function atiUndefined(objeto){
	var keys = Object.keys(objeto)
	for(var i = 0;i<keys.length;i++){
		if(objeto[keys[i]] == undefined){
			objeto[keys[i]] = null
		}
	}
	return objeto
}
var GerenciadorDePoemas ={
	async iniciar(){
		await this.carregarFirestore();
		await this.lerDadosDaDatabase();
		Pagina.telas.atualizarLista("lista-de-poemas");
	},
	async carregarFirestore(){
		await firebase.firestore().enablePersistence({synchronizeTabs:true});
		this.db = firebase.firestore();
	},
	obterPoema(id){
		return this.poemas.find(obj=>obj.id == id);
	},
	pesquisarPoema(termoDeBusca,filtros){
		function analizarString(string,termo){
			if(typeof string == "string"){
				const stringFormatada = string.toLowerCase();
				const termoFormatado = termo.toLowerCase();
				if(stringFormatada.indexOf(termoFormatado) != -1)return true
				else return false
			} else return false
		}
		if(!filtros){filtros=["titulo"]}//,"conteudo"]}
		var posicoesDosPoemas = this.poemas.map((poema,posicao)=>{
			const resultadoDosFiltros = filtros.map(filtro=>{
				if(filtro!="conteudo"){
					const texto = poema[filtro]
					return analizarString(texto,termoDeBusca)
				}
				else{
					const resultadosDasLinhas = poema.linhas.map(linha=>analizarString(linha,termoDeBusca))
					if(resultadosDasLinhas.includes(true))return true
					else return false
				}
			})
			if(resultadoDosFiltros.includes(true))return posicao
		}).filter(elemento=>elemento != null);
		const poemas = posicoesDosPoemas.map(posicao=>{
			return this.poemas[posicao];
		})
		return poemas
	},
	async salvarPoema(id,titulo,linhas,cor,categoriaId,semMensagem){
		var mensagem
		if(semMensagem){
			mensagem = (text)=>{}
		}
		else{
			mensagem = (text)=>{Pagina.mensagem(text)}
		}
		if(id){
			mensagem("Atualizando poema")
			this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/poemas`).doc(id).set({
				titulo,
				linhas,
				cor,
				categoriaId
			}).then(()=>{mensagem("Poema atualizado")}).catch(()=>{mensagem("Erro ao atualizar poema")});
		}
		else{
			mensagem("Criando poema")
			this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/poemas`).add({
				titulo,
				linhas,
				cor,
				categoriaId
			}).then(()=>{mensagem("Poema criado")}).catch(()=>{mensagem("Erro ao criar poema")});
		}
		await this.lerDadosDaDatabase();
	},
	async deletarPoema(id){
		Pagina.mensagem("Aguarde deletando poema")
		this.db.doc(`usuarios/${firebase.auth().currentUser.uid}/poemas/${id}`).delete().then(()=>{Pagina.mensagem("Poema deletado")}).catch(()=>{Pagina.mensagem("Erro ao deletar poema")});
		await this.lerDadosDaDatabase();
	},
	async lerDadosDaDatabase(){
		this.poemas = [];
		this.categorias = {}
		var documentos = (await this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/poemas`).get()).docs;
		documentos.map(documento =>{
			var poema = {
				"titulo": documento.data().titulo,
				"linhas":documento.data().linhas,
				"cor": documento.data().cor,
				"categoriaId":documento.data().categoriaId,
				"id":documento.id
			};
			poema = atiUndefined(poema)
			this.poemas.push(poema);
		})
		documentos = (await this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/categorias`).get()).docs;
		documentos.map(documento =>{
			this.categorias[documento.id] = documento.data().nome
		})
	},
	async criarCategoria(id,nome){
		if(id){
			this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/categorias`).doc(id).set({
				nome
			})
		}
		else{
			this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/categorias`).add({
				nome
			})
		}
		await this.lerDadosDaDatabase();
	},
	async deletarCategoria(id){
		this.db.doc(`usuarios/${firebase.auth().currentUser.uid}/categorias/${id}`).delete()
		await this.lerDadosDaDatabase();
	}
}
var GerenteDeAutenticacao= {
	iniciar(){
		this.autenticacao.iniciar();
	},
	autenticacao:{
		iniciar(){
			firebase.auth().onAuthStateChanged(async(usuario)=>{
				if(usuario && this.deleteProcess != true){
					Pagina.mensagem(`Seja Bem Vindo ${usuario.displayName} ${String.fromCodePoint(0x1F603)}`);
					await GerenciadorDePoemas.iniciar();
					$("#qtd_poemas")[0].innerHTML = GerenciadorDePoemas.poemas.length;
					await Pagina.temaEscuro.iniciar();
					try{await Notificacoes.iniciar()}catch(e){}

				}
				Pagina.login(usuario);
				Pagina.urlSystem();
				
			})
		}
	},
	deletar(){
		var user = firebase.auth().currentUser;
		user.delete().then(function() {
			$(".sidenav").sidenav("close");
			Pagina.mensagem(`Volte Sempre... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
			Pagina.temaEscuro.desativar()
			document.cookie = ""
		}).catch(function(error) {
			if(error.code == "auth/requires-recent-login"){
				this.deleteProcess = true
				Pagina.mensagem("Voce vai ter que entrar no face novamente")
				var provider = new firebase.auth.FacebookAuthProvider();
				firebase.auth().signInWithPopup(provider).then(function(result) {
					var credential = result.credential
					firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
						firebase.auth().currentUser.delete()
						$(".sidenav").sidenav("close");
						Pagina.mensagem(`Volte Sempre... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
						Pagina.temaEscuro.desativar()
						document.cookie = ""
					})
				})
			}
		});
	},
	entrar(){
		var provider = new firebase.auth.FacebookAuthProvider();
		firebase.auth().signInWithRedirect(provider);
	},
	sair(){
		$(".sidenav").sidenav("close");
		Pagina.mensagem(`Saindo... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
		Pagina.temaEscuro.desativar()
		firebase.auth().signOut();
	}
}
var Notificacoes = {
	async iniciar(){
		switch (Notification.permission){
			case 'default':
				this.checkBox(false)
				break;
			case 'denied':
				this.checkBox(false)
				break;
			case 'granted':
				var token = await this.obterToken()
				if(await this.compararToken(token)){
					this.checkBox(true)
				}
				else{
					this.checkBox(false)
				}
				break;
		}
	},
	async obterToken(){
		return await firebase.messaging().getToken().then(token=>{
			return token
		});
	},
	async compararToken(token){
		var tokens = (await GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).get()).data().fcmToken
		if(typeof tokens == "undefined"){tokens = []}
		if(tokens.indexOf(token) == -1){return false}
		else{return true}
	},
	checkBox(isChecked){
		$("#notification").prop("checked",isChecked);
		//$("#tema").attr("checked",false);
	},
	async desativar(token){
		var tokens = (await GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).get()).data().fcmToken
		tokens.splice(tokens.indexOf(token))
		GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).update({
			fcmToken:tokens
		});
	},
	enviarToken(token){
		if(token != undefined){
			GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).get().then(documento=>{
				if(documento.exists){
					var tokens = documento.data().fcmToken
					if(tokens){
						if(tokens.indexOf(token) == -1){
							tokens.push(token)
						}
					}
					else{
						tokens = [token]
					}
					GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).update({
						fcmToken:tokens
					});
				}
				else{
					GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).set({
						fcmToken:[token]
					});
				}
			})
		}
	},
	async checkBoxChange(){
		
		var checked = $("#notification").prop("checked")
		if(checked){
			switch (Notification.permission){
			case 'default':
				try{
					await this.requestPermission()
					var token = await this.obterToken()
					await this.enviarToken(token)
					Pagina.mensagem("Notificações ativadas")
				}
				catch(error){
					if(error.message == "messaging/permission-blocked"){
						Pagina.mensagem("Você negou as notificações",()=>{
							Pagina.modals.clean.openPost("permission-bloqued")
						})
					}
					this.checkBox(false)
				}
				break;
			case 'denied':
				Pagina.mensagem("A permissão de notificações está bloqueada","Pagina.modals.clean.openPost('permission-bloqued')")
				this.checkBox(false)
				break;
			case 'granted':
				var token = await this.obterToken()
				await this.enviarToken(token)
				Pagina.mensagem("Notificações ativadas")
				break;
			}
		}
		else{
			var token = await this.obterToken()
			await this.desativar(token)
			Pagina.mensagem("Notificações Desativadas")
		}
	},
	async requestPermission(){
		return await Notification.requestPermission().catch((erro)=>{
			throw Error(erro.code);
		})
	}
}
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js', {scope:''}).then((registration) => {
		firebase.messaging().useServiceWorker(registration)
	});
}
$(document).ready(()=>{
	if(typeof firebug != "undefined"){firebug.win.hide()}
	Pagina.iniciar();
	const perf = firebase.performance();
	trace = perf.trace('App Data');
	trace.incrementMetric('App Version', 5.0);
	
});
