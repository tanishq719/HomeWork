importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js')

var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];
self.addEventListener('install',
	function(event)
	{
		console.log("[service worker] installing .....");
		event.waitUntil(
			caches.open('precache-v5')				// here caches is an object of cache api but actually a map object
		  .then(cache_obj=>{
				console.log(`[service Worker]installing cache....`);
				cache_obj.addAll(STATIC_FILES);		// what we are storing is not pages alone but the request objects
			}))
	});

self.addEventListener('activate',							// here old matching cache is deleted because at this point of time we
									// we are sure that deleting the old cache will not harm the user experience in any way
	function(event)
	{
		console.log("[service worker] activating ...");
		// return self.client.claim();
		caches.keys()
		.then(keys =>
		{
			// Promise.all() returns a promise when all promises inside all() get resolved
			// .map function is for Arrays, here keys is an array, .map() maps each element of array keys
			// the function is map replaces the promise with
			return Promise.all(keys.map(ikey =>
				{
					if(ikey !== 'precache-v1' && ikey !== 'dynamic_later_caching')
					{
						return caches.delete(ikey);	// confusion!!!!!!!!!!!!!!!!!!!!!!!!
						//caches.delete(ikey);
					}
				}
			))
		})
	});

function trimCache(cacheName, maxLength)
{
	caches.open(cacheName)
	.then( cache_obj =>
	{
		return cache_obj.keys()
		.then(keys =>
		{
			if (keys.length > maxLength)
			{
				console.log('deleting....');
				cache_obj.delete(keys[0])
				.then(trimCache(cacheName, maxLength));		// here point to note is that we are calling recursively
				// only when initial promise gets resolve
			}
		});
	});

}


// cache then NETWORK
// here we are doing work of NETWORK

self.addEventListener('fetch',
event =>
{
	console.log('listining fetch........');
	if(event.request.url.indexOf('https://instapwagram.firebaseio.com/posts') > -1)
		{
			event.respondWith(
				fetch(event.request)
				.then(res =>
				{
						console.log("before caching fetch response...");
						var data = res.clone();
						data.json()
						.then(data_obj =>
						{
							deleteAll('posts')
							.then(()=>{
								for(let key in data_obj)
									writeDB('posts', data_obj[key]);
							});
						})
						.catch(err=>
						console.log('[service worker] promise doesnt get resolve' + err));
						return res;
				})
				.catch((err)=>
				{
					return err;
				})
			);
		}
		// if the request wouldnt be from the given url
		else
		{
			console.log('inside else fetch....');
			event.respondWith(
				caches.match(event.request)
				.then(res =>
					{
						if(res)	return res;
						else {
							return fetch(event.request)
							.then(response =>
							{
								caches.open('dynamic_later_caching')
				 				.then(cache_obj=>
								{
									cache_obj.put(event.request.url, response.clone());
									return response;
								});
							});
						}
					})
				)
		}
	}
);

self.addEventListener('sync', event=>
{
		if(event.tag === 'new-post')
		{
			event.waitUntil(
				readAll('new-sync-post')
				.then((data)=>
				{
					for(var dt of data)
					{
						fetch('https://instapwagram.firebaseio.com/posts.json', {
				    	method: 'POST',
				    	headers: {
				      	'Content-Type':'application/json',
				      	'Accept':'application/json'
				    	},
				    	body:JSON.stringify({
				      	id: dt.id,
				      	title: dt.title,
				      	location: dt.location,
				      	image: "https://firebasestorage.googleapis.com/v0/b/instapwagram.appspot.com/o/sf-boat.jpg?alt=media&token=4590dc6c-0c56-46e6-b5aa-fc7cd919f1e7"
				    	})
				  	})
				  	.then(res=>
				  	{
				    	console.log('data sent');
							if(res.ok)
							{
								res.json()
								.then(resData=>
								{
									deleteItem('new-sync-post', dt.id);
								});
							}
				  	})
						.catch(err=>
						{
							console.log('error'+err);
						});
					}
				})
			);
		}
});


// self.addEventListener('fetch',
// 	function(event)
// 	{
// 		// console.log("[service worker] fetching something ....");
// 		// event.respondWith(fetch(event.request));
// 		event.respondWith
// 		// ** if the response exist in the cache then simply pass it **
// 		(caches.match(event.request)
// 		.then(response => {
// 			if(response)			// this means if response is not null
// 			{
// 				return response;
// 			}
// 			// ** else do dynamic caching of the non cached data
// 			else {
// 					return fetch(event.request)
// 					.then(resp =>
// 					{
// 						return caches.open('dynamic_later_caching')
// 						.then(cache_obj =>
// 						{
// 							cache_obj.put(event.request.url, resp.clone());		// response is needed to be clone because
// 							//https://jakearchibald.com/2014/reading-responses/				// response is a stream once used cant be replenished
// 							return resp;
// 						})
// 						.catch(err =>
// 						{
// 							// this catch block is needed to stop errors poped when we are offline and
// 							// fetching something not cached
// 							console.log(err);
// 						});
// 					});
// 			}
// 		})
// 	)
// 	});

// "auth != null"
