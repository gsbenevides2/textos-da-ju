if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js', {scope:''}).then((registration) => {
		firebase.messaging().useServiceWorker(registration)
	})
}
$(document).ready(()=>{
	Pagina.iniciar();
	const perf = firebase.performance();
	trace = perf.trace('App Data');
	trace.incrementMetric('App Version', 5.0);
});
