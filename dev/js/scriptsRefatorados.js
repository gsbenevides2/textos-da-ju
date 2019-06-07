var Pagina = {
	iniciar(){
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
				$("#poema-modal #cor-botao").attr("onclick",`Pagina.modals.cor.abrir('${id}')`);
				$("#poema-modal #categoria-botao").attr("onclick",`Pagina.modals.categoria.abrir('${id}')`);
				$("#poema-modal #delete-botao").attr("onclick",`Pagina.modals.deletar.abrir('${id}')`);
				$("#poema-modal #editar-botao").attr("onclick",`Pagina.modals.criar.abrir('${id}')`);
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
	mensagem(texto){
		M.Toast.dismissAll();
		M.toast({html:texto,displayLength:1500});
	},
	temaEscuro:{
		elementosDeFundo:["body", ".sidenav", ".sidenav .card",".sidenav .collapsible div", "#criar-modal", "#criar-modal .modal-footer","#deletar-modal","#deletar-modal .modal-footer", "#cor-modal","#more2","#categoria-modal","#Tela_Categorias ul","#Tela_Categorias ul li","select","#criar-categoria-modal","#criar-categoria-modal .modal-footer"],
		elementosDeTexto:[".sem-poemas" , "#Tela_Busca #apresentacao", ".input-field input", ".sidenav", "#criar-modal","#deletar-modal", "textarea","#cor-modal","#more2 a","#criar-modal .modal-footer .btn-flat","#categoria-modal h5","#Tela_Categorias ul li","select","#criar-categoria-modal"],
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
			firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).set({
				temaEscuro:this.ativado
			});
		},
		ativar(){
			$("#tema").attr("checked",true);
			this.ativado = true;
			this.corDeTexto="white"
			$(this.elementosDeFundo.join(",")).addClass("grey darken-4");
			$(this.elementosDeTexto.join(",")).addClass("white-text");

		},
		desativar(){
			$("#tema").attr("checked",false);
			this.ativado = false;
			this.corDeTexto="black"
			$(this.elementosDeFundo.join(",")).removeClass("grey darken-4");
			$(this.elementosDeTexto.join(",")).removeClass("white-text");
		},
		alterarTema(ativar){
			if(ativar)this.ativar();
			else this.desativar();
			this.salvarConfiguracaoDoUsuario();
		}
	},
	elementos:{
		atualizarTextField(){
			M.updateTextFields();
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
		}
	},
	eventos:{
		onresize(funcao){

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
				
				return  `<li class="collection-item waves-effect w-100 ${temaEscuro} row remove-1">  <div onclick="Pagina.telas.categoriaItem('${categoriaId}')"  class="valign-wrapper col s10 remove-2"> <span class="tiny material-icons">brightness_1</span> &emsp;${GerenciadorDePoemas.categorias[categoriaId]}</div><div onclick="Pagina.telas.categoriaDelete('${categoriaId}')" class=" col s2 right-align"><i class="material-icons">delete</i></div></li>`
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
	}
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
					return analizarString(texto,termoDeBusca) //.indexOf(termoDeBusca) != -1){console.log("termo encontrado no titulo");return true}
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
			console.log(documento.data().cor)
			console.log(poema)
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

				}
				Pagina.login(usuario);
			})
		}
	},
	deletar(){
		var user = firebase.auth().currentUser;
		user.delete().then(function() {
			$(".sidenav").sidenav("close");
			Pagina.mensagem(`Saindo... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
			Pagina.temaEscuro.restaurar();
		}).catch(function(error) {
			if(error.code == "auth/requires-recent-login"){
				this.deleteProcess = true
				Pagina.mensagem("Voce vai ter que entrar no face novamente")
				var provider = new firebase.auth.FacebookAuthProvider();
				firebase.auth().signInWithPopup(provider).then(function(result) {
					var credential = result.credential
					firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(function() {
						firebase.auth().currentUser.delete()
						$(".sidenav").sidenav("close");
						Pagina.mensagem(`Saindo... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
						Pagina.temaEscuro.alterarTema(false)
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
		Pagina.temaEscuro.alterarTema(false)
		firebase.auth().signOut();
	}
}
$(document).ready(()=>{
	//firebug.win.hide()
	Pagina.iniciar();
});