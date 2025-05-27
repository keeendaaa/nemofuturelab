from flask import Flask, render_template, request, jsonify
from flask_cors import CORS


app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Счётчик заказов
order_counter = 0
orders = {}

@app.route("/")
def home():
    return render_template("index.html")

# Создать заказ — вернуть ID: 1, 2, 3 и т.д.
@app.route("/api/order", methods=["POST"])
def create_order():
    global order_counter
    data = request.get_json()
    product_id = data.get("productId")
    order_counter += 1
    order_id = str(order_counter)
    # теперь сохраняем и товар
    orders[order_id] = {
        "status": "processing",
        "productId": product_id
    }
    return jsonify({"order_id": order_id})

# Статус заказа
@app.route("/api/order/<order_id>/status", methods=["GET"])
def get_status(order_id):
    order = orders.get(order_id)
    if not order:
        return jsonify({"error": "not found"}), 404
    return jsonify({"status": order["status"]})

@app.route("/api/order/<order_id>", methods=["GET"])
def get_order(order_id):
    order = orders.get(order_id)
    if not order:
        return jsonify({"error": "not found"}), 404
    return jsonify(order)


# Получение заказа
@app.route("/api/order/<order_id>/pickup", methods=["POST"])
def pickup(order_id):
    if order_id in orders:
        orders[order_id]["status"] = "picked"
        return jsonify({"ok": True})
    return jsonify({"error": "not found"}), 404

#if __name__ == "__main__":
#    app.run(host="0.0.0.0", port=5000, debug=True)