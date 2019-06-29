
var Modals = {
	modalcriarEEditarPoema:{
		abrir(idDoPoema){
			if(idDoPoema == null){
				this.novoPoema()
			}
			else{
				this.abrirPoema(idDoPoema)
			}
			$("#poema-modal").modal("close");
			$("#criar-modal").modal("open");
		},
		novoPoema(){
			this.cor = "white"
			this.categoriaId = null
			this.definirInputs(null)
			this.definirCor()
			this.definirCategoria()
			this.definirBotões(null)
		},
		abrirPoema(idDoPoema){
			var poema = GerenciadorDePoemas.obterPoema(idDoPoema);
			this.cor = poema.cor
			this.categoriaId = poema.categoriaId
			this.definirInputs({
				titulo:poema.titulo,
				conteudo:poema.linhas.join("\n")
			})
			this.definirCategoria()
			this.definirCor()
			this.definirBotões(idDoPoema)
		},
		definirInputs(valores){
			if(valores){
				$("#criar-modal #editar-titulo-poema").val(valores.titulo);
				$("#criar-modal #editar-conteudo-poema").val(valores.conteudo);
			}else{
				$("#criar-modal #editar-titulo-poema , #criar-modal #editar-conteudo-poema").val(null);
			}
			Pagina.elementos.textFieldETextArea.atualizar()
		},
		definirBotões(idDoPoema,cor){
			$("#criar-modal #cor-botao").attr("onclick",`Modals.modalCor.abrir(null)`);
			$("#criar-modal #categoria-botao").attr("onclick",`Modals.modalsDeCategoria.modalSelecionar.abrir(null)`);
			$("#criar-modal form").attr("action",`javascript:Modals.modalcriarEEditarPoema.salvarPoema('${idDoPoema}')`);
		},
		definirCategoria(categoriaId){
			if(!categoriaId){categoriaId = this.categoriaId}
			else{this.categoriaId = categoriaId}
			if(categoriaId){
				const nomeDaCategoria = GerenciadorDePoemas.categorias[categoriaId]
				$("#criar-modal #categoria-botao span")[0].innerHTML = nomeDaCategoria
			}
			else{$("#criar-modal #categoria-botao span")[0].innerHTML = ""}
		},
		definirCor(cor){
			if(cor){this.cor = cor}
			$("#criar-modal #cor-botao span").attr("class",`right ${this.cor} transparent-text circle`);
			$("#cor-modal").modal("close");
		},
		async salvarPoema(idDoPoema){
			$("#criar-modal #salvar").prop("disabled",true);
			if(idDoPoema=="null")idDoPoema=null
			const titulo = $("#criar-modal #editar-titulo-poema").val();
			const conteudo = $("#criar-modal #editar-conteudo-poema").val().split("\n");
			const cor = this.cor
			await GerenciadorDePoemas.salvarPoema(idDoPoema,titulo,conteudo,cor,this.categoriaId);
			Telas.atualizarTelas()
			$("#criar-modal #salvar").prop("disabled",false);
			$("#criar-modal").modal("close");
			Pagina.elementos.contadorDePoemas()
		},
		colarDaAreaDeTransferencia(){
			var cookie = Cookies.get("colar")
			if(!cookie){
				Cookies.set("colar",true)
				Modals.modalLimpa.abrirPost("area-de-transferencia")
			}
			navigator.clipboard.readText().then(text=>{
				const array = text.split("\n")
				var titulo = null
				var conteudo = null
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
				Pagina.elementos.textFieldETextArea.atualizar();
			}).catch(error=>{
				if(error.message == "Read permission denied."){Pagina.mensagem("Permisāo da area de transferência bloqueada","Modals.modalLimpa.abrirPost('area-de-transferencia-bloqueada')")}
				else{Pagina.mensagem("Erro desconhecido")}
			})
		}
	},
	modalVisualizarPoema:{
		abrir(idDoPoema){
			const poema = GerenciadorDePoemas.obterPoema(idDoPoema);
			this.definirTituloEConteudo(poema.titulo,poema.linhas);
			this.definirBotao(idDoPoema);
			this.definirCor(poema.cor);
			this.definirCategoria(poema.categoriaId);
			$("#poema-modal").modal("open");
		},
		definirCategoria(idDaCategoria){
			if(idDaCategoria){
				const nomeDaCategoria = GerenciadorDePoemas.categorias[idDaCategoria]
				$("#poema-modal #categoria-botao span")[0].innerHTML = nomeDaCategoria
			}
			else{$("#poema-modal #categoria-botao span")[0].innerHTML = ""}
		},
		copiarParaÁreaDeTransferência(idDoPoema){
			const poema = GerenciadorDePoemas.obterPoema(idDoPoema);
			const texto = poema.titulo + "\n\n" + poema.linhas.join("\n")
			navigator.clipboard.writeText(texto).then(()=>{
				Pagina.mensagem("Copiado")
			}).catch(error=>{
				if(error.message == "Read permission denied."){Pagina.mensagem("Permisāo da area de transferência bloqueada","Modals.modalLimpa.abrirPost('area-de-transferencia-bloqueada')")}
				else{Pagina.mensagem("Erro desconhecido")}
			})
		},
		definirCor(cor){
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
		definirTituloEConteudo(titulo,conteudo){
			$("#poema-modal h5")[0].innerHTML = titulo;
			const texto = conteudo.join("<br>");
			$("#poema-modal p")[0].innerHTML = texto;
		},
		definirBotao(idDoPoema){
			$("#poema-modal #copy").attr("onclick",`Modals.modalVisualizarPoema.copiarParaÁreaDeTransferência('${idDoPoema}')`);
			$("#poema-modal #cor-botao").attr("onclick",`Modals.modalCor.abrir('${idDoPoema}')`);
			$("#poema-modal #categoria-botao").attr("onclick",`Modals.modalsDeCategoria.modalSelecionar.abrir('${idDoPoema}')`);
			$("#poema-modal #delete-botao").attr("onclick",`Modals.modaldeletarPoema.abrir('${idDoPoema}')`);
			$("#poema-modal #compatilhar-botao").attr("onclick",`Modals.modalDeCompatilhamento.abrir('${idDoPoema}')`);
			$("#poema-modal #editar-botao").attr("onclick",`Modals.modalcriarEEditarPoema.abrir('${idDoPoema}')`);
		}
	},
	modaldeletarPoema:{
		abrir(idDoPoema){
			$("#deletar-modal #deletar").attr("onclick",`Modals.modaldeletarPoema.deletar('${idDoPoema}')`);
			$("#deletar-modal").modal("open");
		},
		async deletar(idDoPoema){
			$("#deletar-modal #salvar").prop("disabled",true)
			await GerenciadorDePoemas.deletarPoema(idDoPoema);
			Telas.atualizarTelas()
			$("#deletar-modal #salvar").prop("disabled",false)
			$("#deletar-modal,#poema-modal").modal("close")
			$("#qtd_poemas")[0].innerHTML = GerenciadorDePoemas.poemas.length;
		}
	},
	modalCor:{
		abrir(idDoPoema){
			this.definirClickEmCoresDaPaleta(idDoPoema)
			$("#cor-modal").modal("open");
		},
		definirClickEmCoresDaPaleta(idDoPoema){
			$("#cor-modal a").map(numero=>{
				const corDoBotao = $("#cor-modal a")[numero].classList[1]
				if(idDoPoema != null ){$($("#cor-modal a")[numero]).attr("onclick",`Modals.modalCor.alterarCorDoPoema("${idDoPoema}","${corDoBotao}")`)}
				else{$($("#cor-modal a")[numero]).attr("onclick",`Modals.modalcriarEEditarPoema.definirCor("${corDoBotao}")`)}
			})
		},
		async alterarCorDoPoema(idDoPoema,corSelecionada){
			var poema = GerenciadorDePoemas.obterPoema(idDoPoema)
			await GerenciadorDePoemas.salvarPoema(idDoPoema,poema.titulo,poema.linhas,corSelecionada,poema.categoriaId)
			Modals.modalVisualizarPoema.definirCor(corSelecionada)
			Telas.atualizarTelas()
			$("#cor-modal").modal("close")
		}
	},
	modalsDeCategoria:{
		modalSelecionar:{
			abrir(idDoPoema){
				this.idDoPoema = idDoPoema
				this.atualizarSelect()
				$("#categoria-modal").modal("open")
			},
			atualizarSelect(){
				const categorias = Object.keys(GerenciadorDePoemas.categorias);
				const html = '<option value="" disabled selected>Selecione um:</option>' + categorias.map(idDaCategoria=>{
					return `<option value="${idDaCategoria}">${GerenciadorDePoemas.categorias[idDaCategoria]}</option>`
				}).join('')
				$("select")[0].innerHTML = html
			},
			async categoriaSelecionada(){
				var idDaCategoria = $("select").val()
				var idDoPoema = Modals.modalsDeCategoria.modalSelecionar.idDoPoema
				if(idDoPoema){
					const poema = GerenciadorDePoemas.obterPoema(idDoPoema)
					await GerenciadorDePoemas.salvarPoema(idDoPoema,poema.titulo,poema.linhas,poema.cor,idDaCategoria)
					Modals.modalVisualizarPoema.definirCategoria(idDaCategoria)
				}
				else{
					Modals.modalcriarEEditarPoema.definirCategoria(idDaCategoria)
				}
				Telas.atualizarTelas()
				$("#categoria-modal").modal("close")
			}
		},
		modalCriar:{
			abrir(idDaCategoria){
				this.definirInputEBotao(idDaCategoria)
				$("#criar-categoria-modal").modal("open")
			},
			definirInputEBotao(idDaCategoria){
				if(idDaCategoria){
					$("#criar-categoria-modal #nome-categoria").val((GerenciadorDePoemas.categorias[idDaCategoria]))
				}
				else{
					$("#criar-categoria-modal #nome-categoria").val(null)
				}
				Pagina.elementos.textFieldETextArea.atualizar()
				$("#criar-categoria-modal form").attr("action",`javascript:Modals.modalsDeCategoria.modalCriar.salvarCategoria('${idDaCategoria}')`)
			},
			async salvarCategoria(idDaCategoria){
				$("#criar-categoria-modal #salvar").prop("disabled",true)
				if(idDaCategoria == "null")idDaCategoria=null;
				var nomeDaCategoria = $("#criar-categoria-modal #nome-categoria").val()
				await GerenciadorDePoemas.criarCategoria(idDaCategoria,nomeDaCategoria)
				Modals.modalsDeCategoria.modalSelecionar.atualizarSelect()
				Telas.atualizarTelas()
				$("#criar-categoria-modal #salvar").prop("disabled",false)
				$("#criar-categoria-modal").modal("close")
			}
		}
	},
	modalLimpa:{
		abrir(opcoes){
			if(opcoes.titulo || opcoes.conteudo)this.definirConteudo(opcoes.titulo,opcoes.conteudo)
			this.definirFooter(opcoes.footer)
			$("#clean-modal").modal("open");
		},
		async abrirPost(nomeDoPost){
			Pagina.mensagem("Arguarde um pouco")
			var documento = (await GerenciadorDePoemas.db.doc(`/posts/${nomeDoPost}`).get())
			if(documento.exists){
				var opcoes = {}
				opcoes.titulo = documento.data().titulo
				opcoes.conteudo = documento.data().html
				this.abrir(opcoes)
			}else{
				Pagina.mensagem("Post nāo encontrado")
			}
		},
		definirConteudo(titulo,conteudo){
			$("#clean-modal .modal-content h5")[0].innerHTML = titulo
			$("#clean-modal .modal-content #conteudo")[0].innerHTML = conteudo
		},
		definirFooter(elementosDoFooter){
			if(elementosDoFooter){
				$("#clean-modal .modal-footer")[0].innerHTML = elementosDoFooter
			}else{
				$("#clean-modal .modal-footer")[0].innerHTML = '<a class="btn waves-effect green modal-close">Cancelar</a>'
			}
		}
	},
	modalDeVisualização:{
		abrir(){
			switch(Telas.tamanhoDosElementos){
				case 's6 m6':
					$("#radio1").prop("checked",false);
					$("#radio2").prop("checked",true);
					break
				case 's12 m6':
					$("#radio1").prop("checked",true);
					$("#radio2").prop("checked",false);
					break
			}
			if(Telas.displayDoTexto == "d-none"){
				$("#previa").prop("checked",false);
			}else{
				$("#previa").prop("checked",true);
			}
			if($(".sidenav")[0].M_Sidenav.isOpen){$(".sidenav").sidenav("close")}
			$("#visualizacao-modal").modal("open")
		},
		salvarConfigurações(){
			$("#visualizacao-modal #salvar").prop("disabled", true)
			if($("#radio1").prop("checked")){
				Telas.tamanhoDosElementos = 's12 m6'
			}
			if($("#radio2").prop("checked")){
				Telas.tamanhoDosElementos = 's6 m6'
			}
			if($("#previa").prop("checked")){
				Telas.displayDoTexto =  ""
			}
			else{
				Telas.displayDoTexto = "d-none"
			}
			Telas.atualizarTelas()
			Telas.salvarConfiguraçõesDeLayoutDoUsuario()
			$("#visualizacao-modal #salvar").prop("disabled", false)
			$("#visualizacao-modal").modal("close")
		}
	},
	modalDeCompatilhamento:{
		abrir(idDoPoema){
			this.idDoPoema = idDoPoema
			$("#compatilhar-modal").modal("open")
		},
		compatilharComWhatsapp(){
			const poema = GerenciadorDePoemas.obterPoema(this.idDoPoema);
			const texto = "*"+poema.titulo+"*" + "\n\n" + poema.linhas.join("\n")
			const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`
			window.open(url,"_blank")

			$("#compatilhar-modal").modal("close")
		},
		compatilharComTwitter(){
			const poema = GerenciadorDePoemas.obterPoema(this.idDoPoema);
			const texto = poema.titulo + "\n\n" + poema.linhas.join("\n")
			const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}`
			window.open(url,"_blank")
			$("#compatilhar-modal").modal("close")
		},
		gerarWord(){
			const poema = GerenciadorDePoemas.obterPoema(this.idDoPoema);
			const linhas = (JSON.stringify(poema.linhas))
			window.open(`\word?titulo=${poema.titulo}&autor=${firebase.auth().currentUser.displayName}&linhas=${linhas}`,"_blank")
			$("#compatilhar-modal").modal("close")
		},
		webShare(){
			const poema = GerenciadorDePoemas.obterPoema(this.idDoPoema);
			const texto = poema.titulo + "\n\n" + poema.linhas.join("\n")
			try{
				navigator.share({
					title: poema.titulo,
					text:texto
				})
			}
			catch(error){
				Pagina.mensagem("Erro ao Compatilhar")
			}
			$("#compatilhar-modal").modal("close")
		}
	}
}