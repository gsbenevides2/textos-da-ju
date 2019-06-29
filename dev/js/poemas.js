var GerenciadorDePoemas ={
	async iniciar(){
		if(!navigator.onLine){
			Pagina.mensagem("Off-Line detectado aguarde...")
		}
		await this.carregarFirestore();
		await this.lerDadosDaDatabase();
		
	},
	async carregarFirestore(){
		await firebase.firestore().enablePersistence({synchronizeTabs:true});
		this.db = firebase.firestore();
	},
	obterPoema(id){
		return this.poemas.find((poema,posicao)=>{
			if(poema.id == id){
				poema.posicao = posicao
				return poema
			}
		});
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
			var poema = this.poemas[posicao];
			poema.posicao = posicao
			return poema
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
			poema = removerUndefinedDoObjeto(poema)
			this.poemas.push(poema);
		})
		documentos = (await this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/categorias`).get()).docs;
		documentos.map(documento =>{
			this.categorias[documento.id] = documento.data().nome
		})
	},
	async criarCategoria(id,nome){
		if(id){
			Pagina.mensagem("Alterando Categoria")
			this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/categorias`).doc(id).set({
				nome
			}).then(()=>{
				Pagina.mensagem("Categoria Alterada")
			}).catch(()=>{
				Pagina.mensagem("Erro Ao Alterar Categoria")
			})
		}
		else{
			Pagina.mensagem("Criando Categoria")
			this.db.collection(`usuarios/${firebase.auth().currentUser.uid}/categorias`).add({
				nome
			}).then(()=>{
				Pagina.mensagem("Categoria Criada")
			}).catch(()=>{
				Pagina.mensagem("Erro Ao Criar Categoria")
			})
		}
		await this.lerDadosDaDatabase();
	},
	async deletarCategoria(id){
		Pagina.mensagem("Deletando Categoria")
		this.db.doc(`usuarios/${firebase.auth().currentUser.uid}/categorias/${id}`).delete().then(()=>{
			Pagina.mensagem("Categoria Deletada")
		}).catch(()=>{
			Pagina.mensagem("Erro Ao Deletar Categoria")
		})
		await this.lerDadosDaDatabase();
	}
}
function removerUndefinedDoObjeto(objeto){
	var keys = Object.keys(objeto)
	for(var i = 0;i<keys.length;i++){
		if(objeto[keys[i]] == undefined){
			objeto[keys[i]] = null
		}
	}
	return objeto
}