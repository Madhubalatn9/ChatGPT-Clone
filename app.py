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
    user_input = data.get('question') or request.form.get('input-area') or ''
    attachment = data.get('attachment')
    
    if not user_input.strip() and not attachment:
        return jsonify({'error': 'Please enter a message or attach a file.'}), 400
        
    groq_client = get_client()
    if not groq_client:
        return jsonify({'error': 'GROQ_API_KEY environment variable is not set.'}), 500
        
    try:
        is_image = attachment and isinstance(attachment, dict) and attachment.get('type', '').startswith('image/')
        
        if is_image:
            user_content:list[dict[str,any]] = [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": attachment['base64']
                    }
                }
            ]
            if user_input.strip():
                user_content.append({"type": "text", "text": user_input.strip()})
            else:
                user_content.append({"type": "text", "text": "Describe this image."})
                
            model_to_use = "meta-llama/llama-4-scout-17b-16e-instruct"
            messages_payload :list[dict[str,any]]= [{"role": "user", "content": user_content}]
        else:
            prompt_text = user_input.strip()
            if attachment and isinstance(attachment, dict) and attachment.get('name'):
                prompt_text = f"[Attached file: {attachment.get('name')}]\n\n{prompt_text}".strip()
                
            model_to_use = "openai/gpt-oss-120b"
            messages_payload:list[dict[str,any]] = [{"role": "user", "content": prompt_text}]

        chat_completion = groq_client.chat.completions.create(
            messages=messages_payload, #type: ignore
            model=model_to_use,
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