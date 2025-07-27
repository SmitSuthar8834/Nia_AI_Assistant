import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import axios from 'axios';
import { logger } from '../utils/logger';

interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
}

interface AIResponse {
  text: string;
  intent?: string;
  entities?: Record<string, any>;
}

export class VoiceProcessor {
  private speechClient: SpeechClient;
  private ttsClient: TextToSpeechClient;
  private aiServiceUrl: string;

  constructor() {
    this.speechClient = new SpeechClient();
    this.ttsClient = new TextToSpeechClient();
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3004';
  }

  async speechToText(audioBuffer: Buffer): Promise<TranscriptionResult> {
    try {
      const request = {
        audio: {
          content: audioBuffer.toString('base64'),
        },
        config: {
          encoding: 'WEBM_OPUS' as const,
          sampleRateHertz: 48000,
          languageCode: 'en-IN', // Indian English
          alternativeLanguageCodes: ['hi-IN', 'en-US'], // Hindi and US English as alternatives
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          model: 'latest_long',
        },
      };

      const [response] = await this.speechClient.recognize(request);
      
      if (!response.results || response.results.length === 0) {
        throw new Error('No speech recognized');
      }

      const result = response.results[0];
      const alternative = result.alternatives?.[0];

      if (!alternative) {
        throw new Error('No transcription alternative found');
      }

      return {
        text: alternative.transcript || '',
        confidence: alternative.confidence || 0,
        language: request.config.languageCode
      };
    } catch (error) {
      logger.error('Speech-to-text error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async textToSpeech(text: string, languageCode = 'en-IN'): Promise<Buffer> {
    try {
      const request = {
        input: { text },
        voice: {
          languageCode,
          name: languageCode === 'en-IN' ? 'en-IN-Wavenet-A' : 'en-US-Wavenet-D',
          ssmlGender: 'NEUTRAL' as const,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0,
        },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content generated');
      }

      return Buffer.from(response.audioContent as Uint8Array);
    } catch (error) {
      logger.error('Text-to-speech error:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  async processWithAI(text: string, userId: string): Promise<AIResponse> {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/process`, {
        text,
        userId,
        context: 'voice_interaction'
      });

      return {
        text: response.data.response,
        intent: response.data.intent,
        entities: response.data.entities
      };
    } catch (error) {
      logger.error('AI processing error:', error);
      
      // Fallback response
      return {
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        intent: 'error',
        entities: {}
      };
    }
  }

  async trainVoiceProfile(userId: string, audioSamples: Buffer[]): Promise<void> {
    try {
      // Process multiple audio samples for voice training
      const transcriptions = await Promise.all(
        audioSamples.map(sample => this.speechToText(sample))
      );

      // Store voice profile data (simplified - in production, this would involve ML training)
      const voiceProfile = {
        userId,
        samples: transcriptions.length,
        averageConfidence: transcriptions.reduce((sum, t) => sum + t.confidence, 0) / transcriptions.length,
        languages: [...new Set(transcriptions.map(t => t.language))],
        createdAt: new Date()
      };

      // Store voice profile in database
      const query = `
        INSERT INTO voice_profiles (user_id, samples, average_confidence, languages)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET
          samples = $2,
          average_confidence = $3,
          languages = $4,
          updated_at = NOW()
      `;
      await pool.query(query, [userId, voiceProfile.samples, voiceProfile.averageConfidence, voiceProfile.languages]);
      logger.info(`Voice profile trained for user ${userId}:`, voiceProfile);
    } catch (error) {
      logger.error('Voice training error:', error);
      throw new Error('Failed to train voice profile');
    }
  }

  async getVoiceProfile(userId: string): Promise<any> {
    try {
      const { rows } = await pool.query('SELECT * FROM voice_profiles WHERE user_id = $1', [userId]);
      if (rows.length === 0) {
        throw new Error('Voice profile not found');
      }
      return rows[0];
    } catch (error) {
      logger.error('Get voice profile error:', error);
      throw new Error('Failed to retrieve voice profile');
    }
  }

  async updateVoiceSettings(userId: string, settings: any): Promise<void> {
    try {
      const { speed, pitch, volume } = settings;
      const query = `
        UPDATE voice_profiles
        SET voice_settings = jsonb_set(
          jsonb_set(
            jsonb_set(voice_settings, '{speed}', $2::jsonb),
            '{pitch}', $3::jsonb
          ),
          '{volume}', $4::jsonb
        )
        WHERE user_id = $1
      `;
      await pool.query(query, [userId, speed, pitch, volume]);
      logger.info(`Voice settings updated for user ${userId}:`, settings);
    } catch (error) {
      logger.error('Update voice settings error:', error);
      throw new Error('Failed to update voice settings');
    }
  }
}
import { pool } from '../database/connection';
