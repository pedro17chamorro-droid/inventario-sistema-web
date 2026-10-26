const API_BASE = 'http://127.0.0.1:5000/api';

// Variable para controlar si estamos editando un insumo
let editingItemId = null;

// ==========================
// 📦 GESTIÓN DE INVENTARIO
// ==========================

async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/inventory`);
        const data = await response.json();
        
        const tableBody = document.getElementById('inventory-list');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        let lowStockCount = 0;

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
                <td>
                    <button class="btn-warning" onclick="editItem(${item.id}, '${item.name}', ${item.quantity}, '${item.unit}', ${item.cost})" style="background-color: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Editar</button>
                    <button class="btn-danger" onclick="deleteItem(${item.id})">Borrar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById('total-items').textContent = data.length;
        document.getElementById('low-stock').textContent = lowStockCount;

    } catch (error) {
        console.error('Error al cargar inventario:', error);
    }
}

// Cargar datos en el formulario para editar
function editItem(id, name, quantity, unit, cost) {
    editingItemId = id;
    document.getElementById('name').value = name;
    document.getElementById('quantity').value = quantity;
    document.getElementById('unit').value = unit;
    document.getElementById('cost').value = cost;
    
    // Cambiar texto visual del botón para indicar edición
    const submitBtn = document.querySelector('#inventory-form button');
    submitBtn.textContent = 'Actualizar Insumo';
    submitBtn.style.backgroundColor = '#f39c12';
}

async function deleteItem(id) {
    try {
        const response = await fetch(`${API_BASE}/inventory/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            loadInventory();
        }
    } catch (error) {
        console.error('Error al eliminar insumo:', error);
    }
}

const inventoryForm = document.getElementById('inventory-form');
if (inventoryForm) {
    inventoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const unit = document.getElementById('unit').value;
        const cost = parseFloat(document.getElementById('cost').value);
        const status = quantity > 5 ? 'Suficiente' : 'Stock Bajo';
        
        const itemData = { name, quantity, unit, cost, status };

        try {
            let response;
            if (editingItemId === null) {
                // Crear nuevo
                response = await fetch(`${API_BASE}/inventory`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemData)
                });
            } else {
                // Actualizar existente (PUT)
                response = await fetch(`${API_BASE}/inventory/${editingItemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemData)
                });
                editingItemId = null;
                
                // Restaurar botón
                const submitBtn = document.querySelector('#inventory-form button');
                submitBtn.textContent = 'Guardar Insumo';
                submitBtn.style.backgroundColor = '';
            }

            if (response.ok) {
                inventoryForm.reset();
                loadInventory();
            }
        } catch (error) {
            console.error('Error al guardar/actualizar insumo:', error);
        }
    });
}


// ==========================
// 📋 GESTIÓN DE PEDIDOS
// ==========================

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        const data = await response.json();
        
        const tableBody = document.getElementById('orders-list');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        data.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.client}</td>
                <td>${order.item}</td>
                <td>${order.quantity}</td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 5px; border-radius: 4px;">
                        <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En Proceso" ${order.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
    }
}

// Función para cambiar el estado del pedido al cambiar el selector
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadOrders();
        }
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
    }
}

const orderForm = document.getElementById('order-form');
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const client = document.getElementById('client-name').value;
        const item = document.getElementById('order-item').value;
        const quantity = parseInt(document.getElementById('order-quantity').value);
        const status = 'Pendiente';

        const newOrder = { client, item, quantity, status };

        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            });

            if (response.ok) {
                orderForm.reset();
                loadOrders();
            }
        } catch (error) {
            console.error('Error al guardar pedido:', error);
        }
    });
}


// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadOrders();
});