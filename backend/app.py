from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)  # Habilita CORS para conectar el Frontend

# Función para conectar a la base de datos SQLite
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row  # Permite acceder a las columnas por nombre
    return conn

# Inicializar la base de datos y las tablas si no existen
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tabla de Inventario
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit TEXT NOT NULL,
            cost REAL NOT NULL,
            status TEXT NOT NULL
        )
    ''')
    
    # Tabla de Pedidos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client TEXT NOT NULL,
            item TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            status TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# Ejecutar la creación de la base de datos al arrancar
init_db()


# ==========================
# 📦 RUTAS DE INVENTARIO
# ==========================

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = get_db_connection()
    items = conn.execute('SELECT * FROM inventory').fetchall()
    conn.close()
    return jsonify([dict(row) for row in items])

@app.route('/api/inventory', methods=['POST'])
def add_item():
    new_item = request.json
    status = 'Suficiente' if int(new_item['quantity']) > 5 else 'Stock Bajo'
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO inventory (name, quantity, unit, cost, status) VALUES (?, ?, ?, ?, ?)',
        (new_item['name'], new_item['quantity'], new_item['unit'], new_item['cost'], status)
    )
    conn.commit()
    item_id = cursor.lastrowid
    conn.close()
    
    new_item['id'] = item_id
    new_item['status'] = status
    return jsonify({"message": "Insumo agregado con éxito", "item": new_item}), 201

@app.route('/api/inventory/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item_data = request.json
    status = 'Suficiente' if int(item_data['quantity']) > 5 else 'Stock Bajo'
    
    conn = get_db_connection()
    conn.execute(
        'UPDATE inventory SET name = ?, quantity = ?, unit = ?, cost = ?, status = ? WHERE id = ?',
        (item_data['name'], item_data['quantity'], item_data['unit'], item_data['cost'], status, item_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Insumo actualizado con éxito"}), 200

@app.route('/api/inventory/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM inventory WHERE id = ?', (item_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Insumo eliminado con éxito"}), 200


# ==========================
# 📋 RUTAS DE PEDIDOS
# ==========================

@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    orders = conn.execute('SELECT * FROM orders').fetchall()
    conn.close()
    return jsonify([dict(row) for row in orders])

@app.route('/api/orders', methods=['POST'])
def add_order():
    new_order = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO orders (client, item, quantity, status) VALUES (?, ?, ?, ?)',
        (new_order['client'], new_order['item'], new_order['quantity'], new_order['status'])
    )
    conn.commit()
    order_id = cursor.lastrowid
    conn.close()
    
    new_order['id'] = order_id
    return jsonify({"message": "Pedido creado con éxito", "order": new_order}), 201

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order_status(order_id):
    order_data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        (order_data['status'], order_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Estado del pedido actualizado"}), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)