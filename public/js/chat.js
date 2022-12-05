const socket = io()
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#message-template-two').innerHTML;
const sidebarTemplate =  document.querySelector('#sidebar-template').innerHTML;


//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild;

  //Height of last message
  const newMessageStyle =  getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visibale height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have I scrolled
  const scrollOfset = $messages.scrollTop + visibleHeight;

  //
  if(containerHeight - newMessageHeight <= scrollOfset){
    $messages.scrollTop = $messages.scrollHeight;
  }
}

socket.on('message', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll()
})

socket.on('locationMessage', (url) => {
  console.log(url )
  const html = Mustache.render(locationMessageTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
  //disable
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled')
  const message = e.target.elements.message.value;
  //Acnowledgement

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = '';
    $messageFormInput.focus();
    //enable
    if(error){
      return console.log(error)
    }
    console.log('Message Delivered!')
  })
  
})

$sendLocationButton.addEventListener('click', (e) => {
  //disable
  $sendLocationButton.setAttribute('disabled', 'disabled');
  if(!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation' , {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      console.log('Location shared')
      //enabled
      $sendLocationButton.removeAttribute('disabled');
    })
  })
})

socket.emit('join', { username, room }, (error) => {
  if(error) {
    alert(error)
    location.href = '/'
  }
})




