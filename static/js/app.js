// Данные товаров
const products = [
  { id: 1, name: 'Товар 1', img: 'https://via.placeholder.com/150?text=1' },
  { id: 2, name: 'Товар 2', img: 'https://via.placeholder.com/150?text=2' },
  { id: 3, name: 'Товар 3', img: 'https://via.placeholder.com/150?text=3' },
  { id: 4, name: 'Товар 4', img: 'https://via.placeholder.com/150?text=4' },
  { id: 5, name: 'Товар 5', img: 'https://via.placeholder.com/150?text=5' },
  { id: 6, name: 'Товар 6', img: 'https://via.placeholder.com/150?text=6' }
];
let selectedProduct = null;
let selectedPoint = null;
let map, marker;

// Инициализация интерфейса
initProducts();
setupRouting();
setupAdmin();

function initProducts() {
  const productsDiv = document.getElementById('products');
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `<img src="${p.img}" alt="${p.name}"><p>${p.name}</p>`;
    div.onclick = () => chooseProduct(p);
    productsDiv.appendChild(div);
  });
}

function chooseProduct(p) {
  selectedProduct = p;
  document.getElementById('map').classList.remove('hidden');
  initMap();
}

function initMap() {
  if (!map) {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    const points = [[51.5, -0.09], [51.51, -0.1], [51.49, -0.08]];
    points.forEach(pt => {
      L.marker(pt).addTo(map).on('click', () => selectPoint(pt));
    });
  }
}

function selectPoint(pt) {
  selectedPoint = pt;
  document.getElementById('order-section').classList.remove('hidden');
}

document.getElementById('start-order').onclick = startOrder;

//function startOrder() {
//  document.getElementById('status-section').classList.remove('hidden');
//  document.getElementById('status-text').textContent = 'Заказ обрабатывается...';
//  startTimer();
//}

async function startOrder() {
  // спрячем кнопку, покажем статус
  document.getElementById('status-text').textContent = 'Заказ обрабатывается...';
  document.getElementById('status-section').classList.remove('hidden');

  // 1) создаём заказ на сервере
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: selectedProduct.id })
  });
  const { order_id } = await res.json();
  startTimer(order_id);
}


//function startTimer() {
//  const slider = document.getElementById('slider');
//  const qrDiv = document.getElementById('qrcode');
//  const total = 10;
//  let elapsed = 0;
//
//  slider.max = total;
//  slider.value = 0;
//  slider.disabled = false;
//  qrDiv.innerHTML = '';
//  qrDiv.classList.add('hidden');
//
//  const interval = setInterval(() => {
//    elapsed++;
//    slider.value = elapsed;
//    if (elapsed >= total) {
//      clearInterval(interval);
//      document.getElementById('status-text').textContent = 'Заказ пришёл';
//      qrDiv.classList.remove('hidden');
//      new QRCode(qrDiv, {
//        text: String(selectedProduct.id),
//        width: 128,
//        height: 128
//      });
//    }
//  }, 1000);
//}

function startTimer(orderId) {
  const slider = document.getElementById('slider');
  const qrDiv  = document.getElementById('qrcode');
  const total  = 10;
  let elapsed  = 0;

  slider.max      = total;
  slider.value    = 0;
  slider.disabled = false;  
  qrDiv.innerHTML = '';
  qrDiv.classList.add('hidden');

  const interval = setInterval(() => {
    elapsed++;
    slider.value = elapsed;
    if (elapsed >= total) {
      clearInterval(interval);
      document.getElementById('status-text').textContent = 'Заказ готов';
      qrDiv.classList.remove('hidden');
      new QRCode(qrDiv, { text: orderId, width:128, height:128 });
    }
  }, 1000);
}


function setupRouting() {
  window.addEventListener('hashchange', () => {
    const isAdmin = location.hash === '#admin';
    document.getElementById('main-view').classList.toggle('hidden', isAdmin);
    document.getElementById('admin-view').classList.toggle('hidden', !isAdmin);
  });
  window.dispatchEvent(new Event('hashchange'));
}

//function setupAdmin() {
//  document.getElementById('scan-order').onclick = () => {
//    document.getElementById('reader').classList.remove('hidden');
//    const html5Qr = new Html5Qrcode('reader');
//    html5Qr.start(
//      { facingMode: 'environment' },
//      { fps: 10, qrbox: 250 },
//      decoded => {
//        html5Qr.stop();
//        document.getElementById('reader').classList.add('hidden');
//        document.getElementById('admin-msg').textContent = `Товар получен: ${decoded}`;
//      },
//      err => {}
//    ).catch(err => console.error(err));
//  };
//}

function setupAdmin() {
  document.getElementById('scan-order').onclick = () => {
    document.getElementById('reader').classList.remove('hidden');
    const scanner = new Html5QrcodeScanner('reader', { fps:10, qrbox:250 }, false);
    scanner.render(async decoded => {
      // сообщить серверу о получении
      await fetch(`/api/order/${decoded}/pickup`, { method: 'POST' });
      // получить детали заказа
      const res = await fetch(`/api/order/${decoded}`);
      const order = await res.json();
      const product = products.find(p => p.id == order.productId);
      document.getElementById('admin-msg').textContent =
        product
          ? `Товар получен: ${product.name}`
          : `Заказ ${decoded} принят`;
      await scanner.clear();
    }, err => {});
  };
}
