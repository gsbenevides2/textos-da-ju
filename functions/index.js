const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);


async function deleteCollection(path){
	var documents = (await db.collection(path).get()).docs;
	console.log(documents)
	documents.map(document=>{
		console.log(document)
		var docPath = `${path}/${document.id}`
		db.doc(docPath).delete()
	})
}

let db = admin.firestore();
exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
	const uid = user.uid;
	await deleteCollection(`usuarios/${uid}/poemas`)
	await deleteCollection(`usuarios/${uid}/categorias`)
	db.doc(`usuarios/${uid}`).delete()
	
});
 
 
 
