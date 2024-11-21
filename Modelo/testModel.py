from keras import models
import tensorflow_addons as tfa
from keras.utils import image_dataset_from_directory

# Configuración
MODEL_NAME = 'model.h5'
img_size = 512
batch_size = 64

# Preparación de los datos con aumento de datos
test_data = image_dataset_from_directory(
  './test_img/',
  labels = None,
  color_mode = 'rgb',
  batch_size = batch_size,
  image_size = (img_size, img_size),
  shuffle = False,
  interpolation = 'lanczos3'
)

# Cargar el modelo
model = models.load_model(MODEL_NAME, custom_objects = {'F1Score': tfa.metrics.F1Score})

# Realizar predicciones
predictions = model.predict(test_data)

# 'predictions' contiene una lista de listas donde cada lista son las probabilidades de cada clase de una imagen. La primera posición es la
# probabilidad de que sea falsa y la segunda de que sea real. Por ejemplo, si predictions[0] = [0.1, 0.9], la probabilidad de que la primera
# imagen sea falsa es del 10% y del 90% de que sea real.
for prediction in predictions:
  print(f'Probabilidad de que sea real: {prediction[1] * 100:.2f}%')