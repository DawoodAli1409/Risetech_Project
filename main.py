import os
from flask import Flask, request
from google.cloud import firestore, storage
from docx import Document
from tempfile import NamedTemporaryFile
import base64
import json

app = Flask(__name__)

# Initialize clients
db = firestore.Client()
storage_client = storage.Client()

# Your Firebase Storage bucket name - replace with your actual bucket name
BUCKET_NAME = 'internship-2025-465209.firebasestorage.app'

def create_docx_file(project_data):
    # Create a docx file with project data
    doc = Document()
    doc.add_heading('Project Document', 0)
    for key, value in project_data.items():
        doc.add_paragraph(f"{key}: {value}")
    # Save to a temporary file
    tmp = NamedTemporaryFile(delete=False, suffix='.docx')
    doc.save(tmp.name)
    return tmp.name

def process_firestore_event(event_data):
    # Parse Firestore document fields
    fields = event_data.get('value', {}).get('fields', {})
    project_data = {}
    for k, v in fields.items():
        if 'stringValue' in v:
            project_data[k] = v['stringValue']
        elif 'integerValue' in v:
            project_data[k] = v['integerValue']
        elif 'doubleValue' in v:
            project_data[k] = v['doubleValue']
        elif 'booleanValue' in v:
            project_data[k] = v['booleanValue']
        else:
            project_data[k] = str(v)

    # Create docx file
    docx_path = create_docx_file(project_data)

    # Upload to Firebase Storage under 'documents/' folder
    bucket = storage_client.bucket(BUCKET_NAME)
    # Extract document ID from event resource name
    resource_name = event_data.get('value', {}).get('name', '')
    doc_id = resource_name.split('/')[-1] if resource_name else 'unknown_doc'
    blob = bucket.blob(f"documents/{doc_id}.docx")
    blob.upload_from_filename(docx_path)
    blob.make_public()
    doc_url = blob.public_url

    # Update Firestore document with doc URL in 'documents' field
    doc_ref = db.collection('projects').document(doc_id)
    doc_ref.update({'documents': doc_url})

    # Clean up temp file
    os.remove(docx_path)

    return doc_url

@app.route('/', methods=['POST'])
def handle_event():
    envelope = request.get_json()
    if not envelope:
        return 'Bad Request: no JSON payload', 400

    # Cloud Event data is base64 encoded in 'message.data'
    if 'message' in envelope:
        pubsub_message = envelope['message']
        if 'data' in pubsub_message:
            data_str = base64.b64decode(pubsub_message['data']).decode('utf-8')
            event_data = json.loads(data_str)
            doc_url = process_firestore_event(event_data)
            return f'Docx created and uploaded: {doc_url}', 200
        else:
            return 'Bad Request: no data in message', 400
    else:
        return 'Bad Request: no message field', 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
