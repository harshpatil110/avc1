"""
Configuration management for AI Meeting Assistant
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GOOGLE_CLOUD_KEY = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')  # Path to GCP service account JSON
    
    # Server settings
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # Meeting settings
    MAX_CONTEXT_MESSAGES = 50  # Rolling context window
    AI_TRIGGER_PHRASE = 'hey assistant'
    
    # Audio settings
    SAMPLE_RATE = 16000  # Hz - required for most speech-to-text services
    AUDIO_CHUNK_DURATION = 1  # seconds
    
    # Gemini model
    GEMINI_MODEL = 'gemini-2.0-flash-exp'
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        return True
