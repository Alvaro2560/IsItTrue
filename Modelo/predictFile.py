from keras import models
import tensorflow_addons as tfa
from keras.utils import image_dataset_from_directory
import os

class Predictor:
  def __init__(self, modelFileName, dataPath, batchSize):
    currentDir = os.path.dirname(__file__)
    modelPath = os.path.join(currentDir, modelFileName)
    self.model = models.load_model(modelPath, custom_objects = {'F1Score': tfa.metrics.F1Score})
    self.dataPath = dataPath
    self.imgSize = self.model.input_shape[1:3]
    self.batchSize = batchSize

  def predict(self, desiredClass):
    self.data = image_dataset_from_directory(
      self.dataPath,
      labels = None,
      color_mode = 'rgb',
      batch_size = self.batchSize,
      image_size = self.imgSize,
      shuffle = False
    )
    predictions = self.model.predict(self.data)
    desiredClass = 1 if desiredClass == 'real' else 0
    return predictions[:, desiredClass]
