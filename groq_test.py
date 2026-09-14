import os
import sys
from groq import Groq

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Hi",
        }
    ],
    model="openai/gpt-oss-20b",
)

if chat_completion.choices and chat_completion.choices[0].message:
    print(chat_completion.choices[0].message.content.encode('utf-8', errors='ignore').decode('utf-8'))