var defferedPrompt;

if('serviceWorker' in navigator)
{
	navigator.serviceWorker
	.register('/sw.js')
	.then(function(){
		console.log("service worker registered");
	});
}

window.addEventListener('beforeinstallprompt',
function(event)
{
	console.log('beforeinstallprompt fired');
	event.preventDefault();
	defferedPrompt = event;
	return false;
});

// wait = fetch('https://httpbin.org/post',
// 	{
// 		method : 'POST',
// 		headers: {
// 			'Content-Type' : 'application/json',
// 			'Accept' : 'application/json'
// 		},
// 		mode : 'cors',	// need more research
// 		body: JSON.stringify({message: 'Does this works?'})
// 	});
//
// wait.then( response => {
// 	console.log(response);
// 	return response.json();
// })
// .then(data => console.log(data))
// .catch(err => console.log(err));

/*
var promise = new Promise((resolve, reject) => {
	setTimeOut(()=>
{
	resolve(url);
}, 3000)
});

promise.then(data => {
console.log(data);
})
.catch(err)
{
console.log(err);
};
	*/
