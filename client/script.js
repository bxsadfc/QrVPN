const socket = new WebSocket(`ws://${window.location.host}`);
let paymentId = null;
let userToken = Math.random().toString(36).substring(2);

socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'register', token: userToken }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'payment_status' && data.paymentId === paymentId) {
    document.getElementById('loading').classList.add('hidden');
    if (data.status === 'completed') {
      document.getElementById('qr-code').innerHTML = `<img src="${data.qrCode}" alt="QR Code">`;
      document.getElementById('qr-code').classList.remove('hidden');
      document.getElementById('download-btn').classList.remove('hidden');
      document.getElementById('feedback-form').classList.remove('hidden');
      document.getElementById('cancel-btn').classList.add('hidden');
      document.getElementById('success-sound').play();
    }
  } else if (data.type === 'chat') {
    document.getElementById('chat-messages').innerHTML += `<p>${data.message}</p>`;
  }
};

document.getElementById('buy-btn').addEventListener('click', async () => {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('cancel-btn').classList.remove('hidden');
  const response = await fetch('/buy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': 'simple-csrf-token', // Добавляем CSRF-токен
    },
  });
  const data = await response.json();
  if (data.paymentUrl) {
    paymentId = data.paymentId;
    localStorage.setItem('purchaseCode', data.purchaseCode);
    window.open(data.paymentUrl, '_blank');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement !== document.getElementById('chat-input')) {
    document.getElementById('buy-btn').click();
  }
});

document.getElementById('cancel-btn').addEventListener('click', async () => {
  await fetch('/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': 'simple-csrf-token', // Добавляем CSRF-токен
    },
    body: JSON.stringify({ paymentId }),
  });
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('cancel-btn').classList.add('hidden');
});

document.getElementById('download-btn').addEventListener('click', () => {
  const qrImg = document.querySelector('#qr-code img');
  const link = document.createElement('a');
  link.href = qrImg.src;
  link.download = 'qr-code.png';
  link.click();
});

document.getElementById('refresh-btn').addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'check_status', paymentId }));
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

document.getElementById('chat-toggle').addEventListener('click', () => {
  document.getElementById('chat').classList.toggle('hidden');
});

document.getElementById('chat-send').addEventListener('click', () => {
  const message = document.getElementById('chat-input').value;
  socket.send(JSON.stringify({ type: 'chat', message, token: userToken }));
  document.getElementById('chat-input').value = '';
});

document.getElementById('submit-feedback').addEventListener('click', async () => {
  const feedback = document.getElementById('feedback-text').value;
  await fetch('/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': 'simple-csrf-token', // Добавляем CSRF-токен
    },
    body: JSON.stringify({ feedback }),
  });
  alert('Feedback submitted!');
});

// История покупок
const purchaseCode = localStorage.getItem('purchaseCode');
if (purchaseCode) {
  fetch(`/history/${purchaseCode}`).then(res => res.json()).then(data => {
    if (data.qrCode) {
      document.getElementById('qr-code').innerHTML = `<img src="${data.qrCode}" alt="QR Code">`;
      document.getElementById('qr-code').classList.remove('hidden');
      document.getElementById('download-btn').classList.remove('hidden');
    }
  });
}

// Многоязычность
fetch('/languages/en.json').then(res => res.json()).then(translations => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = translations[el.dataset.i18n] || el.textContent;
  });
  let csrfToken = null;

fetch('/', { method: 'GET' }).then(res => {
  csrfToken = res.headers.get('X-CSRF-Token');
});

// Используйте csrfToken в запросах
document.getElementById('buy-btn').addEventListener('click', async () => {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('cancel-btn').classList.remove('hidden');
  const response = await fetch('/buy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
  });
  const data = await response.json();
  if (data.paymentUrl) {
    paymentId = data.paymentId;
    localStorage.setItem('purchaseCode', data.purchaseCode);
    window.open(data.paymentUrl, '_blank');
  }
});

document.getElementById('cancel-btn').addEventListener('click', async () => {
  await fetch('/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify({ paymentId }),
  });
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('cancel-btn').classList.add('hidden');
});

document.getElementById('submit-feedback').addEventListener('click', async () => {
  const feedback = document.getElementById('feedback-text').value;
  await fetch('/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify({ feedback }),
  });
  alert('Feedback submitted!');
});
});