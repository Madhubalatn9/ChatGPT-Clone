import os
from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
client = None

def get_client():
    global client
    if not client:
        load_dotenv(override=True)
        api_key = os.environ.get("GROQ_API_KEY")
        if api_key:
            client = Groq(api_key=api_key)
    return client

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def get_response():
    data = request.get_json(silent=True) or {}
    user_input = data.get('question') or request.form.get('input-area')
    
    if not user_input or not user_input.strip():
        return jsonify({'error': 'Please enter a message.'}), 400
        
    groq_client = get_client()
    if not groq_client:
        return jsonify({'error': 'GROQ_API_KEY environment variable is not set.'}), 500
        
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": user_input.strip(),
                }
            ],
            model="openai/gpt-oss-20b",
        )
        response_text = chat_completion.choices[0].message.content
        return jsonify({'response': response_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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