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
setupAdmin();