from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import pickle

import cv2
import numpy as np
import tensorflow as tf
from scipy import misc
import datetime
import time
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

from packages import facenet, detect_face

entry = 0 
#images_placeholder = None
embeddings = None
phase_train_placeholder = None
embedding_size = None
    
minsize = 20  # minimum size of face
threshold = [0.6, 0.7, 0.7]  # three steps's threshold
factor = 0.709  # scale factor
image_size = 182
input_image_size = 160  
train_img="./train_img"

HumanNames = os.listdir(train_img)
HumanNames.sort()


api_url_base = 'https://hackathon-faceapp.herokuapp.com/recognize'
headers = {'cache-control': 'no-cache'}
pnet = None
rnet = None
onet = None
#facenet = None
classifier_filename_exp = None
gpu_options = None
sess = None
model = None
class_names = None
npy=''

class VideoCamera(object):
    
    def __init__(self):
        # Open a camera
        print("Inside Init")
        
        #modeldir = './model/20180402-114759.pb'
        
        #print('Loading Model')
        #facenet.load_model(modeldir)
        self.cap = cv2.VideoCapture(0)
      
        # Initialize video recording environment
        self.is_record = False
        self.out = None

        # Thread for recording
        self.recordingThread = None
        
    def load_model(self):
        None
     
    def __del__(self):
        self.cap.release()
    
    def send_email(self, filename):
        fromaddr = "hacksterz18@gmail.com"
        toaddr = "manohar.shanm@gmail.com"
 
        msg = MIMEMultipart()
 
        msg['From'] = fromaddr
        msg['To'] = toaddr
        msg['Subject'] = "Unknown person identified"
        
        body = "Hi, Attached is the unknown person visited the house at " + time.strftime("%d-%m-%Y %H:%M:%S")
 
        msg.attach(MIMEText(body, 'plain'))

        attachment = open(filename, "rb")
 
        part = MIMEBase('application', 'octet-stream')
        part.set_payload((attachment).read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', "attachment; filename= %s" % filename)
 
        msg.attach(part)
 
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(fromaddr, "Login@123")
        text = msg.as_string()
        server.sendmail(fromaddr, toaddr, text)
        server.quit()
    
    def get_frame(self):
        
        global images_placeholder,gpu_options,sess,npu,HumanNames,embeddings,phase_train_placeholder,embedding_size,classifier_filename_exp
        global pnet, rnet, onet, classifier_filename_exp, gpu_options,sess, model, class_names, entry
        modeldir = './model/20180402-114759.pb'
        classifier_filename = './class/classifier.pkl'
        
        minsize = 20  # minimum size of face
        threshold = [0.6, 0.7, 0.7]  # three steps's threshold
        factor = 0.709  # scale factor
        image_size = 182
        input_image_size = 160
        
        entry = entry + 1  
        
        if entry == 1:

            with tf.Graph().as_default():
                gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=0.6)
                sess = tf.Session(config=tf.ConfigProto(gpu_options=gpu_options, log_device_placement=False))
                with sess.as_default():
                    pnet, rnet, onet = detect_face.create_mtcnn(sess, npy)

                print('Loading Model')
                facenet.load_model(modeldir)
                images_placeholder = tf.get_default_graph().get_tensor_by_name("input:0")
                embeddings = tf.get_default_graph().get_tensor_by_name("embeddings:0")
                phase_train_placeholder = tf.get_default_graph().get_tensor_by_name("phase_train:0")
                embedding_size = embeddings.get_shape()[1]


                classifier_filename_exp = os.path.expanduser(classifier_filename)
                with open(classifier_filename_exp, 'rb') as infile:
                    (model, class_names) = pickle.load(infile)

        print('Start Recognition')
            
        ret, frame = self.cap.read()

        frame = cv2.resize(frame, (0,0), fx=1, fy=1)    #resize frame (optional)

        if frame.ndim == 2:
            frame = facenet.to_rgb(frame)
        frame = frame[:, :, 0:3]
        bounding_boxes, _ = detect_face.detect_face(frame, minsize, pnet, rnet, onet, threshold, factor)
        nrof_faces = bounding_boxes.shape[0]
        print('Detected_FaceNum: %d' % nrof_faces)

        if nrof_faces > 0:
            det = bounding_boxes[:, 0:4]
            img_size = np.asarray(frame.shape)[0:2]
            print("img_size ",img_size)

            cropped = []
            scaled = []
            scaled_reshape = []
            bb = np.zeros((nrof_faces,4), dtype=np.int32)

            for i in range(nrof_faces):
                emb_array = np.zeros((1, embedding_size))
                
                bb[i][0] = det[i][0]
                bb[i][1] = det[i][1]
                bb[i][2] = det[i][2]
                bb[i][3] = det[i][3]

                # inner exception
                if bb[i][0] <= 0 or bb[i][1] <= 0 or bb[i][2] >= len(frame[0]) or bb[i][3] >= len(frame):
                    print('Face is very close!')
                    continue

                cropped.append(frame[bb[i][1]:bb[i][3], bb[i][0]:bb[i][2], :])
                cropped[i] = facenet.flip(cropped[i], False)
                scaled.append(misc.imresize(cropped[i], (image_size, image_size), interp='bilinear'))
                scaled[i] = cv2.resize(scaled[i], (input_image_size,input_image_size),
                                               interpolation=cv2.INTER_CUBIC)
                scaled[i] = facenet.prewhiten(scaled[i])
                scaled_reshape.append(scaled[i].reshape(-1,input_image_size,input_image_size,3))
                feed_dict = {images_placeholder: scaled_reshape[i], phase_train_placeholder: False}
                emb_array[0, :] = sess.run(embeddings, feed_dict=feed_dict)
                predictions = model.predict_proba(emb_array)
                print(predictions)
                best_class_indices = np.argmax(predictions, axis=1)
                best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
                # print("predictions")
                print(best_class_indices,' with accuracy ',best_class_probabilities)
                
                #plot result idx under box
                text_x = bb[i][0]
                text_y = bb[i][3] + 20

                # print(best_class_probabilities)
                if best_class_probabilities>0.60:
                    print('best_class_probabilities: ', best_class_probabilities)
                        
                    print('Result Indices: ', best_class_indices[0])
                    print(HumanNames)
                    for H_i in HumanNames:
                        if HumanNames[best_class_indices[0]] == H_i:
                            result_names = HumanNames[best_class_indices[0]]
                                
                            #boxing face
                            cv2.rectangle(frame, (bb[i][0], bb[i][1]-35), (bb[i][2], bb[i][3]), (0, 255, 0), 1)
                                
                            #font = cv2.FONT_HERSHEY_DUPLEX
                            #cv2.putText(frame, result_names,(text_x+6, bb[i][3]-6), font, 1.0, (255,255,255), 1)
                            cv2.putText(frame, result_names, (text_x, text_y), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                                1, (0, 0, 255), thickness=1, lineType=2)
                else:
                    cv2.rectangle(frame, (bb[i][0], bb[i][1]), (bb[i][2], bb[i][3]), (0, 255, 0), 2)
                    cv2.putText(frame, "Unknown", (text_x, text_y), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                        1, (0, 0, 255), thickness=1, lineType=2)
                    directory = "Unknown_" + time.strftime("%Y%m%d-%H")
                    filename = directory + "/Unknown1.jpg"
                    if not os.path.exists(directory):
                            os.makedirs(directory)
                            crop_img = frame[(bb[i][1]):(bb[i][3]), (bb[i][0]):(bb[i][2])]
                            cv2.imwrite(filename, crop_img)   
                            self.send_email(filename)
                    
        if ret:
            print("Inside return ", datetime.datetime.now())
            cv2.imwrite("final2.png", frame)
            ret, jpeg = cv2.imencode('.jpg', frame)

            return jpeg.tobytes()
      
        else:
            return None
