var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (defferedPrompt) {
    defferedPrompt.prompt();
    defferedPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);
      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });
    defferedPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(ipost) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url('+ipost.image+')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = ipost.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = ipost.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


function updateUI(data)
{
  clearCards();
  for(var key in data)
  {
    createCard(data[key]);
  }
}
console.log('1');
var url =  'https://instapwagram.firebaseio.com/posts.json';
var isReceivedFromAnywhere = false;
fetch(url)
  .then(function(res) {
    console.log('2');
    return res.json();
  })
  .then(function(data) {
    console.log('3');
      console.log('4');
      console.log(data);
      isReceivedFromAnywhere = true;
      updateUI(data);
  });


if ('indexedDB' in window){
  readAll('posts')
  .then(data =>
  {
    updateUI(data);
  });
}

// if('caches' in window)
// {
//   caches.match(url)
//   .then(res =>
//   {
//     if(res) return res.json();
//   })
//   .then(data =>
//   {
//     if (!isReceivedFromAnywhere)
//     {
//       isReceivedFromAnywhere = true;
//       updateUI(data);
//     }
//   });
// }


var titleTag = document.querySelector('#title');
var locationTag = document.querySelector('#location');

function sendData()
{
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Accept':'application/json'
    },
    body:{
      id: new Date().toISOString(),
      title: titleTag.value,
      location: locationTag.value,
      image: "https://firebasestorage.googleapis.com/v0/b/instapwagram.appspot.com/o/sf-boat.jpg?alt=media&token=4590dc6c-0c56-46e6-b5aa-fc7cd919f1e7"
    }
  })
  .then(res=>
  {
    console.log('data sent');
  })
}

var form = document.getElementById("form-post");
form.addEventListener('submit', event =>
{
  console.log('inside submit event');
  event.preventDefault();
  if(titleTag.value.trim === '' || locationTag.value.trim === '')
  {
    alert('Nothing entered!!!');
    return;
  }
  closeCreatePostModal();
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(function(sw) {
        var post = {
          id: new Date().toISOString(),
          title: titleTag.value,
          location: locationTag.value
        };
        writeDB('new-sync-post', post)
          .then(function() {
            return sw.sync.register('new-post');
          })
          .then(function() {
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = {message: 'Your Post was saved for syncing!'};
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(function(err) {
            console.log(err);
          });
      });
  } else {
    sendData();
  }
});
