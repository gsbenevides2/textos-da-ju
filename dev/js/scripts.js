//Terminar cor e categoria
//Refatorar
//-Verificar nome das variáveis e funções
//-Reposicionar as funções
//-Evitar Copias Refinar Polir



if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js')
	.then(function () {
		console.log('service worker registered');
	})
	.catch(function () {
		console.warn('service worker failed');
	});
}
var Pagina = {
	iniciar(){
		M.AutoInit();
		$(".dropdown-trigger").dropdown({ hover: false, constrainWidth: false});
		this.interface.iniciar();
		GerenteDeAutenticacao.iniciar();
	},
	interface:{
		iniciar(){
			this.pesquisarTextField();
			this.telaDeCarregamento();
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
		telaAtual: "#Tela_Carregando",
		trocarTela(telaAntiga,telaNova){
			if(!telaAntiga){
				telaAntiga = Pagina.interface.telaAtual;
			}
			Pagina.interface.telaAtual = telaNova;
			$(telaAntiga).css("display","none");
			$(telaNova).css("display","block");
			if(telaAntiga == "#Tela_Carregando"){
				Pagina.window.onresize(null);
			}
			else if(telaAntiga =="#Tela_Busca"){
				$("#Tela_Busca .sem-poemas").hide()
				$("#resultados-de-busca")[0].innerHTML =`<div id="apresentacao" class="${this.tema.textColor}-text container center-align"><i class="material-icons large">search</i><h4>Faça uma busca</h4></div>`;
				$("#pesquisar-tela .material-icons")[0].innerHTML="search";
				$("#pesquisar-tela").attr("onclick","Pagina.interface.trocarTela(null,'#Tela_Busca')");
			}
			if(telaNova == "#Tela_Carregando"){
				$(".mdl-layout-title")[0].innerHTML = "Carregando";
				this.telaDeCarregamento();
				Pagina.window.onresize(this.telaDeCarregamento);
			}
			else if(telaNova =="#Tela_Busca"){
				$("#pesquisar-tela .material-icons")[0].innerHTML="close";
				$("#pesquisar-tela").attr("onclick","Pagina.interface.trocarTela(null,'#Tela_Painel')");
			}
		},
		login(usuario){
			if(usuario){
				if(usuario.photoURL){
					$(".card-img img").attr("src",`${usuario.photoURL}?type=large`);
				}
				$("#user_name")[0].innerHTML = usuario.displayName;
				$(".logado").show();
				
				Pagina.interface.trocarTela(null,"#Tela_Painel");
			}
			else{
				$(".card-img img").attr("src","");
				$("#user_name")[0].innerHTML = "Seja Bem-vindo";
				$(".logado").hide();
				Pagina.interface.trocarTela(null,"#Tela_Home");
			}
		},
		atualizarLista(nomeDaLista,array){
			var poemas = array;
			if(nomeDaLista == "lista-de-poemas") poemas = GerenciadorDePoemas.poemas;
			var html = "";
			poemas.map((poema)=>{
				if(poema.linhas.length >= 2){var primeiroParagrafo = poema.linhas[0]+"<br>"+poema.linhas[1];}
				else{var primeiroParagrafo = poema.linhas[0]}
				
				var colorText = "white";
				if(poema.cor == "white" || poema.cor == "yellow" || poema.cor=="amber" || !poema.cor) colorText = "black"
				if(!poema.cor) poema.cor = "white";
				html += `<div class="col s12 m6"><div class="card ${poema.cor} ${colorText}-text"><div class="card-content"><span class="card-title">${poema.titulo}</span><p>${primeiroParagrafo}</p></div><div class="card-action right-align"><a class="btn btn-flat ${colorText}-text waves-effect" onclick="Pagina.interface.abrirPoema('${poema.id}')">Abrir</a></div></div></div>`;
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
		pesquisarPoema(){
			const termoDeBusca = $("#pesquisar").val();
			if(termoDeBusca != "" && this.telaAtual == "#Tela_Busca"){
				const resultadoDaBusca = GerenciadorDePoemas.pesquisarPoema(termoDeBusca)
				this.atualizarLista("resultados-de-busca", resultadoDaBusca);
			}
		},
		abrirModalCor(id){
			console.log(id)
			$("#cor-modal").modal("open");
			$("#cor-modal a").map(numero=>{
				const cor = $("#cor-modal a")[numero].classList[1]
				$($("#cor-modal a")[numero]).attr("onclick",`Pagina.interface.alterarCor("${id}","${cor}")`)
			})
		},
		async alterarCor(id,cor){
			console.log(id)
			const poema = GerenciadorDePoemas.obterPoema(id);
			await GerenciadorDePoemas.salvarPoema(id,poema.titulo,poema.linhas,cor);
			var colorText = "white";
			if(cor == "white" || cor == "yellow" || cor=="amber" ) colorText = "black";
			$("#poema-modal").attr("class", `modal ${cor} ${colorText}-text`);
			$("#poema-modal ul").attr("class", `${cor} dropdown-content`);
			$("#poema-modal .modal-footer").attr("class",`modal-footer right-align ${cor}`);
			$("#poema-modal .modal-footer a").removeClass(`white-text`);
			$("#poema-modal .modal-footer a").removeClass(`black-text`);
			$("#poema-modal .modal-footer a").addClass(`${colorText}-text`);
			$("#cor-modal").modal("close");
			this.atualizarLista("lista-de-poemas");
			this.pesquisarPoema()
		},
		abrirPoema(id){
			const poema = GerenciadorDePoemas.obterPoema(id);
			var colorText = "white";
			if(poema.cor == "white" || poema.cor == "yellow" || poema.cor=="amber"|| !poema.cor) colorText = "black";
			if(!poema.cor) poema.cor = "white";
			$("#poema-modal").attr("class", `modal ${poema.cor} ${colorText}-text`);
			$("#poema-modal ul").attr("class", `${poema.cor} dropdown-content`);
			$("#poema-modal .modal-footer").attr("class",`modal-footer right-align ${poema.cor}`);
			$("#poema-modal .modal-footer a").removeClass(`white-text`);
			$("#poema-modal .modal-footer a").removeClass(`black-text`);
			$("#poema-modal .modal-footer a").addClass(`${colorText}-text`);
			$("#poema-modal h5")[0].innerHTML = poema.titulo;
			const conteudo = poema.linhas.join("<br>");
			$("#poema-modal p")[0].innerHTML = conteudo;
			$("#poema-modal #cor-botao").attr("onclick",`Pagina.interface.abrirModalCor('${id}')`);
			$("#poema-modal #delete-botao").attr("onclick",`Pagina.interface.removerPoema('${id}')`);
			$("#poema-modal #editar-botao").attr("onclick",`Pagina.interface.editarPoema('${id}')`);
			$("#poema-modal").modal("open");
		},
		criarPoema(){
			$("#criar-modal #editar-titulo-poema").val(null);
			$("#criar-modal #editar-conteudo-poema").val(null);
			this.atualizarTextField();
			$("#criar-modal form").attr("action",`javascript:Pagina.interface.salvarPoema(null)`);
			$("#criar-modal").modal("open");
		},
		editarPoema(id){
			this.fecharModal("poema");
			const poema = GerenciadorDePoemas.obterPoema(id);
			$("#criar-modal #editar-titulo-poema").val(poema.titulo);
			const conteudo = poema.linhas.join("\n");
			$("#criar-modal #editar-conteudo-poema").val(conteudo);
			this.atualizarTextField();
			$("#criar-modal form").attr("action",`javascript:Pagina.interface.salvarPoema('${id}')`);
			$("#criar-modal").modal("open");
		},
		removerPoema(id){
			this.fecharModal("poema");
			$("#deletar-modal #deletar").attr("onclick",`Pagina.interface.deletarPoema('${id}')`);
			$("#deletar-modal").modal("open");
		},
		async deletarPoema(id){
			await GerenciadorDePoemas.deletarPoema(id);
			this.atualizarLista("lista-de-poemas");
			this.pesquisarPoema();
			this.fecharModal("deletar");
			$("#qtd_poemas")[0].innerHTML = GerenciadorDePoemas.poemas.length;
		},
		fecharModal(nomeDaModal){
			$(`#${nomeDaModal}-modal`).modal("close");
		},
		async salvarPoema(id){
			const titulo = $("#criar-modal #editar-titulo-poema").val();
			const conteudo = $("#criar-modal #editar-conteudo-poema").val().split("\n");
			if(id){var cor = GerenciadorDePoemas.obterPoema(id).cor;}
			else{ var cor = null}
			await GerenciadorDePoemas.salvarPoema(id,titulo,conteudo,cor);
			this.atualizarLista("lista-de-poemas");
			this.pesquisarPoema();
			this.fecharModal("criar");
			$("#qtd_poemas")[0].innerHTML = GerenciadorDePoemas.poemas.length;
		},
		atualizarTextField(){
			M.updateTextFields();
		},
		mensagem(texto){
			M.Toast.dismissAll();
			M.toast({html:texto,displayLength:1500});
		},
		pesquisarTextField(){
			$("#pesquisar").on("keyup",(e)=>{
				/*var key = e.which || e.keyCode;
				if (key == 13) */this.pesquisarPoema();
			})
		},
		telaDeCarregamento(){
			const top = ($(document).height() - $(".nav-wrapper").height() - $(".preloader-wrapper").height())/2;
			$(".preloader-wrapper").css("margin-top",top);
			const left = ($("body").width() - $(".preloader-wrapper").width())/2;
			$(".preloader-wrapper").css("left",left);
			Pagina.window.onresize(this.telaDeCarregamento);
		},
		tema:{
			async iniciar(){
				await this.lerTema();
			},
			backgroundElements:["body", ".sidenav", ".sidenav .card",".sidenav .collapsible div", "#criar-modal", "#criar-modal .modal-footer","#deletar-modal","#deletar-modal .modal-footer", "#cor-modal","#more2"],
			textElements:[".sem-poemas" , "#Tela_Busca #apresentacao", ".input-field input", ".sidenav", "#criar-modal","#deletar-modal", "textarea","#cor-modal","#more2 a","#criar-modal .modal-footer .btn-flat"],
			async lerTema(){
				const documento = (await GerenciadorDePoemas.db.doc(`usuarios/${firebase.auth().currentUser.uid}`).get())
				if(documento.exists){
					if(documento.data().temaEscuro)this.aplicarModoEscuro();
					else this.restaurar();
				}
				else{
					firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).set({
						temaEscuro:this.temaEscuro
					});
				}
			},
			alterarTema(){
				if($("#tema").prop("checked")){
					this.aplicarModoEscuro();
				}
				else{
					this.restaurar();
				}
				firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).set({
					temaEscuro:this.temaEscuro
				});
			},
			aplicarModoEscuro(){
				$("#tema").attr("checked",true);
				this.temaEscuro = true;
				this.textColor="white"
				$(this.backgroundElements.join(",")).addClass("grey darken-4");
				$(this.textElements.join(",")).addClass("white-text");
			},
			temaEscuro: false,
			restaurar(){
				$("#tema").attr("checked",false);
				this.temaEscuro = false;
				this.textColor="black"
				$(this.backgroundElements.join(",")).removeClass("grey darken-4");
				$(this.textElements.join(",")).removeClass("white-text");
			}
		}
	},
	window:{
		onresize(funcao){
			window.addEventListener("resize",funcao,false);
		}
	}
};
var GerenciadorDePoemas ={
	async iniciar(){
		await this.carregarFirestore();
		await this.lerDadosDaDatabase();
		Pagina.interface.atualizarLista("lista-de-poemas");
	},
	async carregarFirestore(){
		await firebase.firestore().enablePersistence();
		this.db = firebase.firestore();
	},
	obterPoema(id){
		return this.poemas.find(obj=>obj.id == id);
	},
	pesquisarPoema(termoDeBusca,filtros){
		function analizarString(string,termo){
			const stringFormatada = string.toLowerCase();
			const termoFormatado = termo.toLowerCase();
			if(stringFormatada.indexOf(termoFormatado) != -1)return true
			else return false
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
	async salvarPoema(id,titulo,linhas,cor){
		if(id){
			Pagina.interface.mensagem("Atualizando poema")
			this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/poemas`).doc(id).set({
				titulo,
				linhas,
				cor
			}).then(()=>{Pagina.interface.mensagem("Poema atualizado")}).catch(()=>{Pagina.interface.mensagem("Erro ao atualizar poema")});
		}
		else{
			Pagina.interface.mensagem("Criando poema")
			this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/poemas`).add({
				titulo,
				linhas,
				cor
			}).then(()=>{Pagina.interface.mensagem("Poema criado")}).catch(()=>{Pagina.interface.mensagem("Erro ao criar poema")});
		}
		await this.lerDadosDaDatabase();
	},
	async deletarPoema(id){
		Pagina.interface.mensagem("Aguarde deletando poema")
		this.db.doc(`usuarios/${firebase.auth().currentUser.uid}/poemas/${id}`).delete().then(()=>{Pagina.interface.mensagem("Poema deletado")}).catch(()=>{Pagina.interface.mensagem("Erro ao deletar poema")});
		await this.lerDadosDaDatabase();
	},
	async lerDadosDaDatabase(){
		this.poemas = [];
		const documentos = (await this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/poemas`).get()).docs;
		documentos.map(documento =>{
			var poema = {
				"titulo": documento.data().titulo,
				"linhas":documento.data().linhas,
				"cor": documento.data().cor,
				"id":documento.id
			};
			this.poemas.push(poema);
		})
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
					Pagina.interface.mensagem(`Seja Bem Vindo ${usuario.displayName} ${String.fromCodePoint(0x1F603)}`);
					await GerenciadorDePoemas.iniciar();
					$("#qtd_poemas")[0].innerHTML = GerenciadorDePoemas.poemas.length;
					await Pagina.interface.tema.iniciar();
					
				}
				Pagina.interface.login(usuario);
			})
		}
	},
	deletar(){
		var user = firebase.auth().currentUser;
		user.delete().then(function() {
			$(".sidenav").sidenav("close");
			Pagina.interface.mensagem(`Saindo... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
			Pagina.interface.tema.restaurar();
		}).catch(function(error) {
			if(error.code == "auth/requires-recent-login"){
				this.deleteProcess = true
				Pagina.interface.mensagem("Voce vai ter que entrar no face novamente")
				var provider = new firebase.auth.FacebookAuthProvider();
				firebase.auth().signInWithPopup(provider).then(function(result) {
					var credential = result.credential
					firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(function() {
						firebase.auth().currentUser.delete()
						$(".sidenav").sidenav("close");
						Pagina.interface.mensagem(`Saindo... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
						Pagina.interface.tema.restaurar();
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
		Pagina.interface.mensagem(`Saindo... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
		Pagina.interface.tema.restaurar();
		firebase.auth().signOut();
	}
}
$(document).ready(()=>{
	firebug.win.hide()
	Pagina.iniciar();
});