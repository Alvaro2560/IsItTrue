from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from waitress import serve
import logging
from Modelo.predictFile import Predictor

app = Flask(__name__)

# Configurar logging para mostrar detalles de Waitress
logging.basicConfig(
  level = logging.DEBUG,  # Tipo de mensajes a mostrar (en este caso, todos porque es DEBUG)
  format = "%(asctime)s [%(levelname)s] %(message)s", # Formato de los mensajes
  handlers = [ # Qué hacer con los mensajes
    logging.StreamHandler()  # Mostrar logs en la consola
  ]
)

# Middleware para loggear la IP del cliente
@app.before_request
def log_ip():
  client_ip = request.remote_addr
  app.logger.info(f"Solicitud entrante {request.method} desde IP: {client_ip} ")

# Añadir CORS para permitir peticiones desde cualquier origen solo en la ruta /upload
CORS(app, resources = {r"/upload": {"origins": "*"}})

# Ruta para almacenar las imágenes subidas
currentDir = os.path.dirname(__file__)
UPLOAD_FOLDER = os.path.join(currentDir, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
PREDICTOR = Predictor('model.h5', UPLOAD_FOLDER, 64)
app.config['PREDICTOR'] = PREDICTOR

@app.route('/upload', methods=['POST'])
def upload_file():
  # Verificar si hay un archivo en la solicitud
  if 'image' not in request.files:
    return jsonify({'error': 'No file part'}), 400
  
  file = request.files['image']
  # Verificar si se subió un archivo
  if file.filename == '':
    return jsonify({'error': 'No selected image'}), 400
  
  # Guardar el archivo
  if file:
    filePath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filePath)
      
    app.logger.info(f"Archivo subido y guardado: \"{file.filename}\" Tamaño: {os.path.getsize(filePath)} bytes")

    # Incluir predicción TODO: Cambiar por la predicción real
    result = app.config['PREDICTOR'].predict('real')[0]

    os.remove(filePath)
    return jsonify({'percentage': f'{result * 100:.2f}'}), 200 # Retornar probabilidad de que la imagen sea real

if __name__ == '__main__':
  # Ejecutar el servidor con Waitress
  serve(app, host = '0.0.0.0', port = 8080)
    