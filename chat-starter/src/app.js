import './index.html';
import './scss/style.scss';
import firebase from 'firebase/app';
import './scss/edit-message-popup.scss';
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

  document.querySelector(`[data-id="${id}"] .fa-pen`).addEventListener('click', () => {
    // console.log('klikk a szerkesztésre');
    displayEditMessage(id);
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

function displayEditMessage(id) {
  const markup = /*html*/`
  <div class="popup-container" id="popup">
    <div class="edit-message" id="edit-message" data-id="${id}">
      <div id="close-popup" class="button">
        Close <i class="fa fa-window-close" aria-hidden="true"></i>
      </div>
      <textarea id="edit" name="" cols="30" rows="10">${document.querySelector(`.message[data-id="${id}"] .message-text`).textContent.trim()
    }</textarea>
      <div id="save-message" class="button">
        Save message<i class="fas fa-save"></i>
      </div>
    </div>
  </div>
`;
  document.querySelector('#app').insertAdjacentHTML('afterbegin', markup);
  document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('popup').remove();
  });

  document.getElementById('save-message').addEventListener('click', () => {
    const newMessage = document.querySelector('#edit').value;
    // const id = document.querySelector('#edit-message').dataset.id;
    modifyMessage(newMessage, id);
  });

}

async function modifyMessage(newMessage, id) {
  if (newMessage) {
    await db.collection('messages').doc(id).update({
      message: newMessage
    });
    document.querySelector(`.message[data-id="${id}"] .message-text`).textContent = newMessage;
  }

}

// listen for changes in the database
db.collection('messages').orderBy('date', 'asc')
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        displayMessage(change.doc.data(), change.doc.id);
      }
      if (change.type === 'modified') {
        console.log('modified database!')
      }
      if (change.type === 'removed') {
        removeMessage(change.doc.id);
      }
    });
  });

