var Pagina = {
	iniciar(){
		this.elementos.centralizarSpinner()
		this.configurações.modoEscuro.lerConfiguraçãoDosCookies();
		M.AutoInit()
		$(".dropdown-trigger").dropdown({ hover: false, constrainWidth: false});
		$("#criar-modal,#deletar-modal").modal({dismissible:false})
		this.elementos.textFieldETextArea.preparar()
		this.elementos.prepararSelect()
		this.elementos.checkBoxPreparar()
		this.elementos.animaçãoDoLogo()
		Autenticação.iniciar();
	},
	elementos:{
		centralizarSpinner(){
			const top = ($(document).height() - $(".nav-wrapper").height() - $(".preloader-wrapper").height())/2;
			$(".preloader-wrapper").css("margin-top",top);
			const left = ($("body").width() - $(".preloader-wrapper").width())/2;
			$(".preloader-wrapper").css("left",left);
			window.addEventListener("resize",this.centralizarSpinner,false);
		},
		textFieldETextArea:{
			preparar(){
				$("#pesquisar").on("keyup",(e)=>{
					Telas.telaDePesquisa.pesquisar()
				})
			},
			atualizar(){
				M.updateTextFields();
				M.textareaAutoResize($('#editar-conteudo-poema'))
			}
		},
		animaçãoDoLogo(){
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
		prepararSelect(){
			$("select").on('change',Modals.modalsDeCategoria.modalSelecionar.categoriaSelecionada)
		},
		contadorDePoemas(){
			$("#qtd_poemas")[0].innerHTML = GerenciadorDePoemas.poemas.length;
		},
		checkBoxPreparar(){
			$("#tema").click(()=>{
				Pagina.configurações.modoEscuro.alterarTema($("#tema").prop("checked"))
			})
			$("#notification").click(async ()=>{
				if(typeof Notification != "undefined"){
					await Notificacoes.checkBoxChange()
				}else{
					Notificacoes.checkBox(false)
					Pagina.mensagem("Seu Navegador não suporta notificações")
				}
			})
		},
		animateCSS(element, animationName, callback) {
			const node = document.querySelector(element)
			node.classList.add('animated' ,"faster", animationName)
			function handleAnimationEnd() {
				node.classList.remove('animated', animationName)
				node.removeEventListener('animationend', handleAnimationEnd)
				if (typeof callback === 'function') callback()
			}
			node.addEventListener('animationend', handleAnimationEnd)
		}
	},
	mensagem(texto,ação){
		if(ação){
			var  html= `<span>${texto}</span><button class=" red-text btn-flat" onclick="${ação}">Ajuda</button>`
			
		}else{
			var html = texto
		}
		M.Toast.dismissAll();
		M.toast({html,displayLength:1500});
	},
	determinarTelaDeAcordoComAAutentição(usuário){
		if(usuário){
			if(usuário.photoURL){
				$(".card-img img").attr("src",`${usuário.photoURL}?type=large`);
			}
			$("#user_name")[0].innerHTML = usuário.displayName;
			$(".logado").show();
			Telas.trocar(null,"#Tela_Painel");
		}
		else{
			$(".card-img img").attr("src","");
			$("#user_name")[0].innerHTML = "Seja Bem-vindo";
			$(".logado").hide();
			Telas.trocar(null,"#Tela_Home");
		}
	},
	configurações:{
		modoEscuro:{
			elementosDeTextoASeremAplicados:[".sem-poemas" , "#Tela_Busca #apresentacao", ".input-field input", ".sidenav", "#criar-modal","#deletar-modal", "textarea","#cor-modal","#more2 a","#criar-modal .modal-footer .btn-flat","#categoria-modal h5","#Tela_Categorias ul li","select","#criar-categoria-modal","#clean-modal","#clean-modal .modal-content","#visualizacao-modal","#visualizacao-modal .modal-footer","#compatilhar-modal"],
			elementosDeFundoASeremAplicados:["body", ".sidenav", ".sidenav .card",".sidenav .collapsible .collapsible-header", "#criar-modal", "#criar-modal .modal-footer","#deletar-modal","#deletar-modal .modal-footer", "#cor-modal","#more2","#categoria-modal","#Tela_Categorias ul","#Tela_Categorias ul li","select","#criar-categoria-modal","#criar-categoria-modal .modal-footer","#clean-modal","#clean-modal .modal-footer","#visualizacao-modal","#visualizacao-modal .modal-footer","#compatilhar-modal"],
			lerConfiguraçãoDosCookies(){
				var configuração = Cookies.get('modoEscuro')//cookies.buscar("modoEscuro")
				if(configuração == "true"){
					this.ativar()
				}
				else{
					this.desativar()
				}
			},
			async lerConfiguraçãoDoUsuário(){
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
			async alterarTema(ativar){
				Pagina.mensagem("Alterando Tema")
				if(ativar)this.ativar();
				else this.desativar();
				firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).get().then(documento=>{
					if(documento.exists){
						firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).update({
							temaEscuro:this.ativado
						});
					}
					else{
						firebase.firestore().doc(`usuarios/${firebase.auth().currentUser.uid}`).set({
							temaEscuro:this.ativado
						});
					}
				})
			},
			ativar(){
				$("#tema").prop("checked",true);
				Cookies.set("modoEscuro",true)
				this.ativado = true;
				this.corDeTexto="white"
				$(this.elementosDeFundoASeremAplicados.join(",")).addClass("grey darken-4");
				$(this.elementosDeTextoASeremAplicados.join(",")).addClass("white-text");
				Telas.atualizarTelas()
			},
			desativar(){
				$("#tema").prop("checked",false);
				Cookies.set("modoEscuro",false)
				this.ativado = false;
				this.corDeTexto="black"
				$(this.elementosDeFundoASeremAplicados.join(",")).removeClass("grey darken-4");
				$(this.elementosDeTextoASeremAplicados.join(",")).removeClass("white-text");
				Telas.atualizarTelas()
			}
		}
	}
}