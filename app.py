import io
import cv2
import PIL 
import numpy as np
from flask import Flask,render_template,send_from_directory,request,redirect,session,send_file
import aspose.words as aw


lic = aw.License()

# Try to set license from the folder with the python script.
lic = aw.License()

 
# file formats .pdf / .png / .jpg / .jpeg / .docx

app = Flask(__name__,static_url_path='/static',template_folder='pages')
app.secret_key = "mysupersecretkey"

@app.route('/')
def index():
    return render_template('index.html')

# route for static
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)




# render sample.pdf as image in route
@app.route('/sample')
def sample():
    # convert pdf to image
    doc = aw.Document("sample.pdf")
    for page in range(0, doc.page_count):
        extractedPage = doc.extract_pages(page, 1)
        extractedPage.save(f"Output_{page + 1}.jpg")

    return send_file('Output_1.jpg', mimetype='image/jpg')
    

if __name__ == '__main__':
    app.run(debug=True)








