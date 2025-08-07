# Use official Python image as base
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source code
COPY main.py .

# Expose port
ENV PORT 8080
EXPOSE 8080

# Command to run the app
CMD ["python", "main.py"]
