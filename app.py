import os
from flask import Flask, render_template, request
from groq import Groq

app=Flask(__name__)

client=Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def get_response():
    input_area=request.form.get('input-area')
    return render_template('index.html')

@app.route('/images')
def image():
    return render_template('image.html')

@app.route('/library')
def library():
    return render_template('library.html')

@app.route('/plugins')
def plugins():
    return render_template('plugins.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

if __name__ == '__main__':
    app.run(debug=True)