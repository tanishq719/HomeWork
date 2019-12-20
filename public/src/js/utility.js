var dbPromise = idb.open('post-store', 1, db =>				// name of database, version_no,
//function that will be executed whenever the promise get resolve
{
		if(!db.objectStoreNames.contains('posts'))
			db.createObjectStore('posts', {keyPath:'id'});

			if(!db.objectStoreNames.contains('new-sync-post'))
				db.createObjectStore('new-sync-post', {keyPath:'id'});
});

function writeDB(st, idata)
{
  return dbPromise
  .then(db =>
  {
		console.log("@@@@@@@@@@@writing the indexdb@@@@@@@@@@@");
    let tx = db.transaction(st, 'readwrite');
    let store = tx.objectStore(st);
    console.log('[service worker] inside transaction..');
    store.put(idata);
    return tx.complete;
  })
	.catch(err=>console.log(err));
}

function readAll(st)
{
  return dbPromise
  .then(db =>
    {
      let tx = db.transaction(st, 'readonly');
      let store = tx.objectStore(st);
      return store.getAll();
    }
  );
}

function deleteAll(st)
{
  return dbPromise
  .then(db =>
  {
    let tx = db.transaction(st, 'readwrite');
    let store = tx.objectStore(st);
    store.clear();
    return tx.complete;
  })
}

function deleteItem(st, id)
{
	dbPromise
	.then(db =>
	{
		var tx = db.transaction(st, 'readwrite');
		var store = tx.objectStore(st);
		store.delete(id);
		return tx.complete;
	})
	.then(()=>
		{
			console.log("Item deleted");
		}
	);
}
