import { CRMAdapter } from '../services/CRMSyncService';

export class SalesforceAdapter implements CRMAdapter {
  async connect(config: any): Promise<void> {
    console.log('Salesforce adapter connected (mock)');
  }

  async disconnect(): Promise<void> {
    console.log('Salesforce adapter disconnected (mock)');
  }

  async createLead(leadData: any): Promise<any> {
    return { id: 'sf_lead_' + Date.now(), ...leadData };
  }

  async updateLead(leadId: string, updates: any): Promise<any> {
    return { id: leadId, ...updates };
  }

  async getLead(leadId: string): Promise<any> {
    return { id: leadId, name: 'Mock Lead' };
  }

  async searchLeads(query: any): Promise<any[]> {
    return [{ id: 'sf_lead_1', name: 'Mock Lead 1' }];
  }

  async createTask(taskData: any): Promise<any> {
    return { id: 'sf_task_' + Date.now(), ...taskData };
  }

  async updateTask(taskId: string, updates: any): Promise<any> {
    return { id: taskId, ...updates };
  }

  async getTasks(filters: any): Promise<any[]> {
    return [{ id: 'sf_task_1', title: 'Mock Task 1' }];
  }

  async createMeeting(meetingData: any): Promise<any> {
    return { id: 'sf_meeting_' + Date.now(), ...meetingData };
  }

  async updateMeeting(meetingId: string, updates: any): Promise<any> {
    return { id: meetingId, ...updates };
  }

  async getMeetings(filters: any): Promise<any[]> {
    return [{ id: 'sf_meeting_1', title: 'Mock Meeting 1' }];
  }

  async getLastSyncTimestamp(): Promise<Date> {
    return new Date();
  }

  async syncData(since: Date): Promise<any> {
    return { synced: true, timestamp: since };
  }
}