from flask import Flask, render_template, Response, jsonify, request
from camera import VideoCamera
import datetime

app = Flask(__name__)

video_camera = None
global_frame = None

if video_camera == None:
        video_camera = VideoCamera()
        
facenet_model = video_camera.load_model()

@app.route('/')
def index():
    return render_template('index.html')

def video_stream():
    global video_camera 
    global global_frame

    if video_camera == None:
        video_camera = VideoCamera()
        
    while True:
        #print('Start Recognition')
        frame = video_camera.get_frame()

        if frame != None:
            global_frame = frame
            print("printing frame ",datetime.datetime.now())
            yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
        else:
            yield (b'--frame\r\n'
                            b'Content-Type: image/jpeg\r\n\r\n' + global_frame + b'\r\n\r\n')

@app.route('/video_viewer')
def video_viewer():
    return Response(video_stream(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, threaded=True)