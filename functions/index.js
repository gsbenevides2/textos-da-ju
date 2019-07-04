const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {SignIn, Image, BasicCard, Button} = require("actions-on-google")
admin.initializeApp(functions.config().firebase);
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
const request = require ("request")

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
 
 
 
