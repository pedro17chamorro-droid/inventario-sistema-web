from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Habilita CORS para conectar el Frontend

# Datos de prueba iniciales
inventory_data = [
    {"id": 1, "name": "Harina de Trigo", "quantity": 25, "unit": "Kg", "cost": 1.20, "status": "Suficiente"},
    {"id": 2, "name": "Mantequilla", "quantity": 2, "unit": "Kg", "cost": 4.50, "status": "Stock Bajo"}
]

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    return jsonify(inventory_data)

@app.route('/api/inventory', methods=['POST'])
def add_item():
    new_item = request.json
    new_item['id'] = len(inventory_data) + 1
    inventory_data.append(new_item)
    return jsonify({"message": "Insumo agregado con éxito", "item": new_item}), 201
# Ruta para eliminar un insumo por su ID (API DELETE)
@app.route('/api/inventory/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    global inventory_data
    inventory_data = [item for item in inventory_data if item['id'] != item_id]
    return jsonify({"message": "Insumo eliminado con éxito"}), 200
if __name__ == '__main__':
    app.run(debug=True, port=5000)