const API_URL = 'http://127.0.0.1:5000/api/inventory';

// Cargar el inventario y actualizar estadísticas al abrir la página
async function loadInventory() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        const tableBody = document.getElementById('inventory-list');
        tableBody.innerHTML = ''; // Limpiar la tabla

        let lowStockCount = 0;

        // Recorrer los datos para la tabla y contar los de stock bajo
        data.forEach(item => {
            if (item.status === 'Stock Bajo') {
                lowStockCount++;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>$${item.cost.toFixed(2)}</td>
                <td><span class="badge ${item.status === 'Suficiente' ? 'ok' : 'alert'}">${item.status}</span></td>
                <td><button class="btn-danger" onclick="deleteItem(${item.id})">Borrar</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Actualizar dinámicamente las tarjetas de resumen (KPIs)
        document.getElementById('total-items').textContent = data.length;
        document.getElementById('low-stock').textContent = lowStockCount;

    } catch (error) {
        console.error('Error al conectar con le backend:', error);
    }
}

// Función para eliminar un insumo
async function deleteItem(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadInventory(); // Recargar la tabla y contadores automáticamente
        }
    } catch (error) {
        console.error('Error al eliminar el insumo:', error);
    }
}

// Enviar nuevo insumo desde el formulario
document.getElementById('inventory-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    const cost = parseFloat(document.getElementById('cost').value);
    
    const status = quantity > 5 ? 'Suficiente' : 'Stock Bajo';
    const newItem = { name, quantity, unit, cost, status };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            document.getElementById('inventory-form').reset();
            loadInventory(); 
        }
    } catch (error) {
        console.error('Error al guardar el insumo:', error);
    }
});

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', loadInventory);