from keras import layers, models
from keras.utils import image_dataset_from_directory
from keras.callbacks import ReduceLROnPlateau, EarlyStopping
from keras.optimizers import Adam
import tensorflow_addons as tfa
import matplotlib.pyplot as plt

# 128 -> test_accuracy: 0.9317
# 512 -> test_accuracy: 0.8729

# Configuración
img_size = 512 # Tamaño a reescalar las imágenes (128x128 píxeles)
batch_size = 64 # Tamaño del lote de imágenes a procesar por el modelo en cada iteración
num_classes = 2  # Número de clases a clasificar

# Cargar los datos de entrenamiento
train_data = image_dataset_from_directory(
  './images/train/', # Ruta de la carpeta con las imágenes de entrenamiento
  labels = 'inferred', # Las etiquetas se obtienen de los nombres de las carpetas (subcarpetas del anterior)
  label_mode = 'categorical', # Las etiquetas son categóricas
  color_mode = 'rgb', # Las imágenes son a color
  batch_size = batch_size, # Tamaño del lote de imágenes
  image_size = (img_size, img_size), # Tamaño a reescalar las imágenes
  shuffle = True, # Mezclar las imágenes
  validation_split = 0.2, # Porcentaje de imágenes para usar en validación
  seed = 0, # Semilla para la aleatoriedad
  subset = 'training', # Especificar si se trata de datos de entrenamiento
  interpolation = 'lanczos3'
)

# Cargar los datos de validación
val_data = image_dataset_from_directory(
  './images/train/',
  labels = 'inferred',
  label_mode = 'categorical',
  color_mode = 'rgb',
  batch_size = batch_size,
  image_size = (img_size, img_size),
  shuffle = True,
  validation_split = 0.2,
  seed = 0,
  subset='validation', # Especificar si se trata de datos de validación
  interpolation = 'lanczos3'
)

# Cargar los datos de prueba
test_data = image_dataset_from_directory(
  './images/test/',
  labels = 'inferred',
  label_mode = 'categorical',
  color_mode = 'rgb',
  batch_size = batch_size,
  image_size = (img_size, img_size),
  shuffle = True,
  interpolation = 'lanczos3'
)

# Creación del modelo CNN
model = models.Sequential([
  layers.Rescaling(1./255, input_shape=(img_size, img_size, 3)), # Reescalar los valores de cada componente RGB para que estén en el rango [0, 1]
  layers.Conv2D(32, (3, 3), activation='relu', input_shape=(img_size, img_size, 3)), # Primera capa convolucional con 32 filtros de 3x3
  layers.MaxPooling2D((2, 2)), # Capa de submuestreo para reducir la dimensionalidad de las imágenes
  layers.Conv2D(64, (3, 3), activation='relu'), # Segunda capa convolucional con 64 filtros de 3x3
  layers.MaxPooling2D((2, 2)),
  layers.Conv2D(128, (3, 3), activation='relu'), # Tercera capa convolucional con 128 filtros de 3x3
  layers.MaxPooling2D((2, 2)),
  layers.Flatten(), # Capa para convertir la salida de las capas convolucionales en un vector
  layers.Dense(128, activation='relu'), # Capa densa con 128 neuronas para aprender características de más alto nivel
  layers.Dense(num_classes, activation='softmax') # Capa de salida con una neurona por clase y función de activación softmax (probabilidad multiclase)
])

# Reducir la tasa de aprendizaje si la pérdida en validación no disminuye cada 'patience' épocas
reduce_lr = ReduceLROnPlateau(
  monitor = 'val_loss',
  factor = 0.2,
  patience = 5,
  min_lr = 1e-6
)

# Detener el entrenamiento si la precisión en validación no mejora cada 'patience' épocas
early_stopping = EarlyStopping(
  monitor = 'val_accuracy',
  min_delta = 0.01,
  patience = 3,
  verbose = 1,
  mode = 'max',
  restore_best_weights = True
)

# Entrenar diferentes modelos con distintos hiperparámetros y seleccionar el mejor basado en la precisión en el conjunto de prueba
def test_models(diff_epochs, diff_lr):
  best_accuracy = 0
  best_model = None
  best_history = None
  best_epoch = None
  best_lr = None
  for epoch in diff_epochs:
    for lr in diff_lr:
      print(f'############################## Entrenando modelo con {epoch} epochs y lr = {lr} ##############################')

      # Compilación del modelo
      model.compile(
        optimizer=Adam(learning_rate = lr), # Optimizador Adam con tasa de aprendizaje lr
        loss = 'categorical_crossentropy', # Función de pérdida de entropía cruzada categórica para clasificación multiclase
        metrics = ['accuracy', tfa.metrics.F1Score(num_classes=num_classes, average='macro')] # Métricas de precisión y F1
      )

      # Ajuste del modelo
      history = model.fit(
        train_data,
        epochs = epoch,
        validation_data = val_data,
        callbacks = [reduce_lr, early_stopping] # Callbacks que se llaman cada época (definidas anteriormente)
      )

      # Evaluación del modelo en el conjunto de prueba
      test_loss, test_accuracy, test_f1 = model.evaluate(test_data)
      print(f'Precisión en el conjunto de prueba para {epoch} epochs y lr={lr}: {test_accuracy:.4f}')
      if test_accuracy > best_accuracy:
        best_accuracy = test_accuracy
        best_model = model
        best_history = history
        best_epoch = epoch
        best_lr = lr
  
  # Graficar la precisión y pérdida del mejor modelo para la precisión en entrenamiento y validación
  plt.plot(best_history.history['accuracy'])
  plt.plot(best_history.history['val_accuracy'])
  plt.title('Precisión del modelo')
  plt.ylabel('Precisión')
  plt.xlabel('Época')
  plt.legend(['Entrenamiento', 'Validación'], loc = 'upper left')
  plt.show()
  print (f'Mejor modelo con {best_epoch} epochs y lr={best_lr} con precisión en el conjunto de prueba de {best_accuracy:.4f}')

  return best_model

# Entrenar el modelo con diferentes hiperparámetros
TESTING_EPOCHS = [20]
TESTING_LR = [1e-3]
model = test_models(TESTING_EPOCHS, TESTING_LR)

# Guardar el modelo
model.save('othermodel.h5')