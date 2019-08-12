function URLsEspecificas(){
	var url = new URL(window.location.href);
	var modo = url.searchParams.get("mode");
	if(modo == "clean_modal"){
		var post = url.searchParams.get("post");
		if(post){
			Modals.modalLimpa.abrirPost(post)
		}
	}
	else if(modo == "poema"){
		var id = url.searchParams.get("id");
		if(id){Modals.modalVisualizarPoema.abrir(id)}
	}
	else if(modo == "criar"){
		var id = url.searchParams.get("id");
		Modals.modalcriarEEditarPoema.abrir(id)
	}
}



var Autenticação = {
	iniciar(){
		firebase.apps[0].options.authDomain= window.location.href
		firebase.auth().onAuthStateChanged(async(usuário)=>{
			if(usuário && this.deletandoConta != true){
				Pagina.mensagem(`Seja Bem Vindo ${usuário.displayName} ${String.fromCodePoint(0x1F603)}`);
				await GerenciadorDePoemas.iniciar();
				await Telas.lerConfiguraçõesDeLayoutDoUsuario()
				Telas.atualizarLista("lista-de-poemas");
				Pagina.elementos.contadorDePoemas()
				await Pagina.configurações.modoEscuro.lerConfiguraçãoDoUsuário();
				try{await Notificacoes.iniciar()}catch(e){}
				URLsEspecificas()
			}
			Pagina.determinarTelaDeAcordoComAAutentição(usuário);
		})
	},
	entrar(){
		var provider = new firebase.auth.FacebookAuthProvider();
		firebase.auth().signInWithRedirect(provider);
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
	sair(){
		$(".sidenav").sidenav("close");
		Pagina.mensagem(`Saindo... tchau ${String.fromCodePoint(0x1F44B)}${String.fromCodePoint(0x1F44B)}`)
		Pagina.configurações.modoEscuro.desativar()
		firebase.auth().signOut();
	}
}