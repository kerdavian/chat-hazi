import './index.html';
import './scss/style.scss';
import firebase from 'firebase/app';

import 'firebase/firestore';
import config from './db_config.js';
import scrolIntoView from 'scroll-into-view-if-needed';


const firedb = firebase.initializeApp(config);
const db = firedb.firestore();

async function sendMessage(data) {
  const res = await db.collection('messages').add(data);
  document.querySelector('#message').value = '';
  console.log(res);
}

function displayMessage(message, id) {

  // olyan mintha alapértelmezetten a rendszer idő formátumát használná, így lehet, hogy hu-HU nem is kell
  const messageDOM = `
      <div class="message" data-id="${id}">
        <i class="fas fa-user"></i>
        <div>
          <span class="username">${message.username}
            <time>${message.date.toDate().toLocaleString('hu-HU')}</time>
          </span>
          <br>
          <span class="message-text">
            ${message.message}
          </span>
        </div>
        <div class="message-edit-buttons">
          <i class="fas fa-trash-alt"></i>
          <i class="fas fa-pen"></i>
        </div>
      </div>
  `;
  document.querySelector('#messages').insertAdjacentHTML('beforeend', messageDOM);
  scrolIntoView(document.querySelector('#messages'), {
    scrollMode: 'if-needed',
    block: 'end'
  });

  document.querySelector(`[data-id="${id}"] .fa-trash-alt`).addEventListener('click', () => {
    removeMessage(id);
    deleteMessages(id);
  });

}

function createMessage() {
  const message = document.querySelector('#message').value;
  const username = document.querySelector('#nickname').value;
  const date = firebase.firestore.Timestamp.fromDate(new Date());
  // ha a változó neve ugyanaz mint a key amit létre akarunk hozni
  // az objectben akkor nem kell kétszer kiírni...
  return { message, username, date };
}

//UI-ról való törlés
function removeMessage(id) {
  document.querySelector(`[data-id="${id}"]`).remove();
}

//db-ből való törlés
async function deleteMessages(id) {
  await db.collection('messages').doc(id).delete();
}


async function displayAllMessages() {
  const query = await db.collection('messages').orderBy('date', 'asc').get();
  query.forEach((doc) => {
    displayMessage(doc.data());
  });
}

function handleMessage() {
  const message = createMessage();
  if (message.username && message.message) {
    sendMessage(message);
    // displayMessage(message);
  }
}

// amikor a html teljesen betölt: 
window.addEventListener('DOMContentLoaded', () => {
  // displayAllMessages(); 
  document.querySelector('#send').addEventListener('click', () => {
    handleMessage();
  });
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    handleMessage();
  }
});



// listen for changes in the database
db.collection('messages').orderBy('date', 'asc')
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        displayMessage(change.doc.data(), change.doc.id);
      }
      if (change.type === 'modified') {
        console.log('Modified message: ', change.doc.data());
      }
      if (change.type === 'removed') {
        removeMessage(change.doc.id);
      }
    });
  });

