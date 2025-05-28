// admin.js
async function setupAdmin() {
  // Загрузка товаров с сервера
  const productsResponse = await fetch('/api/products');
  const products = await productsResponse.json();

  document.getElementById('scan-order').onclick = () => {
    document.getElementById('reader').classList.remove('hidden');
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);
    
    scanner.render(async (decoded) => {
      try {
        // Отметить заказ как полученный
        await fetch(`/api/order/${decoded}/pickup`, { method: 'POST' });
        
        // Получить информацию о заказе
        const orderResponse = await fetch(`/api/order/${decoded}`);
        const order = await orderResponse.json();
        
        // Найти товар по ID
        const product = products.find(p => p.id === order.productId);
        
        // Вывести результат
        document.getElementById('admin-msg').textContent = 
          product 
            ? `Товар получен: ${product.name}` 
            : `Заказ ${decoded} не найден`;
        // Вывести карточку товара
        const cardDiv = document.getElementById('product-card');
        if (product) {
          cardDiv.innerHTML = `
            <div class="scanned-product-card">
              <img src="/static/resources/product${product.id}.png" alt="${product.name}" class="scanned-product-img">
              <div class="scanned-product-info">
                <div class="scanned-product-title">${product.name}</div>
                ${product.desc ? `<div class='scanned-product-desc'>${product.desc}</div>` : ''}
              </div>
            </div>
          `;
        } else {
          cardDiv.innerHTML = '';
        }
        
        await scanner.clear();
      } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('admin-msg').textContent = 'Ошибка сканирования';
      }
    }, (error) => {
      console.error('Ошибка сканера:', error);
    });
  };
}

// Инициализация
window.onload = function() {
  setupAdmin();
  // Карта полетов справа
  if (document.getElementById('flight-map')) {
    var map = L.map('flight-map').setView([56.834717, 60.791897], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    // Кастомные иконки дронов
    var drone1Icon = L.icon({
      iconUrl: '/static/resources/drone1.svg',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24]
    });
    var drone2Icon = L.icon({
      iconUrl: '/static/resources/drone2.svg',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24]
    });
    // Маркеры дронов
    L.marker([56.835602, 60.792852], {icon: drone1Icon}).addTo(map).bindPopup('Дрон 1');
    L.marker([56.832758, 60.794864], {icon: drone2Icon}).addTo(map).bindPopup('Дрон 2');
  }
};