from keras import layers, models
from keras.utils import image_dataset_from_directory
from keras.callbacks import ReduceLROnPlateau, EarlyStopping
from keras.optimizers import Adam
import tensorflow_addons as tfa
import matplotlib.pyplot as plt

# A example CNN model
from keras import layers, models

numClases = 3
model = models.Sequential([
  layers.Rescaling(1./255, input_shape=(128, 128, 3)),
  layers.Conv2D(16, 3, padding = 'same', activation = 'relu'),
  layers.MaxPooling2D(),
  layers.Conv2D(32, 3, padding = 'same', activation = 'relu'),
  layers.MaxPooling2D(),
  layers.Flatten(),
  layers.Dense(128, activation = 'relu'),
  layers.Dense(numClases, activation = 'softmax') # sigmoid o relu
])

# Compile the model
model.compile(optimizer = Adam(learningRate = 0.001),
              loss = 'categorical_crossentropy',
              metrics = ['accuracy'])

# Load the data
train_data = image_dataset_from_directory(
  './images/train/',
  labels = 'inferred',
  label_mode = 'categorical',
  color_mode = 'rgb',
  batch_size = 32,
  image_size = (128, 128),
  shuffle = True,
  validation_split = 0.2,
  seed = 0,
  subset = 'training', # validation
  interpolation = 'lanczos3'
)

val_data = image_dataset_from_directory(
  './images/train/',
  labels = 'inferred',
  label_mode = 'categorical',
  color_mode = 'rgb',
  batch_size = 32,
  image_size = (128, 128),
  shuffle = True,
  validation_split = 0.2,
  seed = 0,
  subset='validation',
  interpolation = 'lanczos3'
)

test_data = image_dataset_from_directory(
  './images/test/',
  labels = 'inferred',
  label_mode = 'categorical',
  color_mode = 'rgb',
  batch_size = 32,
  image_size = (128, 128),
  shuffle = True,
  interpolation = 'lanczos3'
)

# Train the model
history = model.fit(train_data,
                    validation_data = val_data,
                    epochs=10)

# Evaluate the model
test_loss, test_accuracy = model.evaluate(test_data)
print(f'Test accuracy: {test_accuracy}')

new_data = []

# Predict the class of a new image
# Example with 3 classes and softmax:
predictions = model.predict(new_data)
print(predictions)
# -> [[0.1, 0.2, 0.7], [0.3, 0.4, 0.3], ...]
