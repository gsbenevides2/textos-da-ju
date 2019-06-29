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
							Modals.modalLimpa.abrirPost("permission-bloqued")
						})
					}
					this.checkBox(false)
				}
				break;
			case 'denied':
				Pagina.mensagem("A permissão de notificações está bloqueada","Modals.modalLimpa.abrirPost('permission-bloqued')")
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