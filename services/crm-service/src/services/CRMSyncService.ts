import cron from 'node-cron';
import { SalesforceAdapter } from '../adapters/SalesforceAdapter';
import { CreatioAdapter } from '../adapters/CreatioAdapter';
import { SAPAdapter } from '../adapters/SAPAdapter';
import { logger } from '../utils/logger';

export enum CRMType {
  SALESFORCE = 'salesforce',
  CREATIO = 'creatio',
  SAP = 'sap'
}

export interface CRMAdapter {
  connect(config: any): Promise<void>;
  disconnect(): Promise<void>;
  
  // Lead operations
  createLead(leadData: any): Promise<any>;
  updateLead(leadId: string, updates: any): Promise<any>;
  getLead(leadId: string): Promise<any>;
  searchLeads(query: any): Promise<any[]>;
  
  // Task operations
  createTask(taskData: any): Promise<any>;
  updateTask(taskId: string, updates: any): Promise<any>;
  getTasks(filters: any): Promise<any[]>;
  
  // Meeting operations
  createMeeting(meetingData: any): Promise<any>;
  updateMeeting(meetingId: string, updates: any): Promise<any>;
  getMeetings(filters: any): Promise<any[]>;
  
  // Sync operations
  getLastSyncTimestamp(): Promise<Date>;
  syncData(since: Date): Promise<any>;
}

export class CRMSyncService {
  private adapters: Map<CRMType, CRMAdapter>;
  private syncJobs: Map<string, cron.ScheduledTask>;

  constructor() {
    this.adapters = new Map();
    this.syncJobs = new Map();
    
    // Initialize adapters
    this.adapters.set(CRMType.SALESFORCE, new SalesforceAdapter());
    this.adapters.set(CRMType.CREATIO, new CreatioAdapter());
    this.adapters.set(CRMType.SAP, new SAPAdapter());
  }

  async configureCRM(userId: string, crmType: CRMType, config: any): Promise<void> {
    try {
      const adapter = this.adapters.get(crmType);
      if (!adapter) {
        throw new Error(`Unsupported CRM type: ${crmType}`);
      }

      // Test connection
      await adapter.connect(config);
      
      // Store configuration in database
      // TODO: Implement database storage
      
      // Setup periodic sync for this user's CRM
      this.setupUserSync(userId, crmType, config);
      
      logger.info(`CRM configured for user ${userId}: ${crmType}`);
    } catch (error) {
      logger.error(`Failed to configure CRM for user ${userId}:`, error);
      throw error;
    }
  }

  async testConnection(crmType: CRMType, config: any): Promise<boolean> {
    try {
      const adapter = this.adapters.get(crmType);
      if (!adapter) {
        throw new Error(`Unsupported CRM type: ${crmType}`);
      }

      await adapter.connect(config);
      await adapter.disconnect();
      
      return true;
    } catch (error) {
      logger.error(`Connection test failed for ${crmType}:`, error);
      return false;
    }
  }

  async performCRMOperation(
    userId: string, 
    crmType: CRMType, 
    operation: string, 
    data: any
  ): Promise<any> {
    try {
      const adapter = this.adapters.get(crmType);
      if (!adapter) {
        throw new Error(`Unsupported CRM type: ${crmType}`);
      }

      // Get user's CRM configuration
      const config = await this.getUserCRMConfig(userId, crmType);
      await adapter.connect(config);

      let result;
      switch (operation) {
        case 'createLead':
          result = await adapter.createLead(data);
          break;
        case 'updateLead':
          result = await adapter.updateLead(data.id, data.updates);
          break;
        case 'getLead':
          result = await adapter.getLead(data.id);
          break;
        case 'searchLeads':
          result = await adapter.searchLeads(data.query);
          break;
        case 'createTask':
          result = await adapter.createTask(data);
          break;
        case 'updateTask':
          result = await adapter.updateTask(data.id, data.updates);
          break;
        case 'getTasks':
          result = await adapter.getTasks(data.filters);
          break;
        case 'createMeeting':
          result = await adapter.createMeeting(data);
          break;
        case 'updateMeeting':
          result = await adapter.updateMeeting(data.id, data.updates);
          break;
        case 'getMeetings':
          result = await adapter.getMeetings(data.filters);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      await adapter.disconnect();
      
      // Log the operation
      await this.logCRMOperation(userId, crmType, operation, 'success', result);
      
      return result;
    } catch (error) {
      logger.error(`CRM operation failed for user ${userId}:`, error);
      
      // Log the error
      await this.logCRMOperation(userId, crmType, operation, 'error', error);
      
      throw error;
    }
  }

  private setupUserSync(userId: string, crmType: CRMType, config: any): void {
    const jobKey = `${userId}-${crmType}`;
    
    // Cancel existing job if any
    const existingJob = this.syncJobs.get(jobKey);
    if (existingJob) {
      existingJob.stop();
    }

    // Setup new sync job (every 15 minutes)
    const job = cron.schedule('*/15 * * * *', async () => {
      await this.syncUserData(userId, crmType, config);
    }, {
      scheduled: false
    });

    this.syncJobs.set(jobKey, job);
    job.start();
    
    logger.info(`Sync job started for user ${userId}: ${crmType}`);
  }

  private async syncUserData(userId: string, crmType: CRMType, config: any): Promise<void> {
    try {
      const adapter = this.adapters.get(crmType);
      if (!adapter) return;

      await adapter.connect(config);
      
      // Get last sync timestamp
      const lastSync = await adapter.getLastSyncTimestamp();
      
      // Sync data since last sync
      const syncResult = await adapter.syncData(lastSync);
      
      await adapter.disconnect();
      
      // Process and store synced data
      await this.processSyncedData(userId, crmType, syncResult);
      
      logger.info(`Data synced for user ${userId}: ${crmType}`);
    } catch (error) {
      logger.error(`Sync failed for user ${userId}:`, error);
    }
  }

  private async getUserCRMConfig(userId: string, crmType: CRMType): Promise<any> {
    // TODO: Retrieve from database
    return {};
  }

  private async logCRMOperation(
    userId: string, 
    crmType: CRMType, 
    operation: string, 
    status: string, 
    result: any
  ): Promise<void> {
    // TODO: Store in database
    logger.info(`CRM Operation Log: ${userId} - ${crmType} - ${operation} - ${status}`);
  }

  private async processSyncedData(userId: string, crmType: CRMType, data: any): Promise<void> {
    // TODO: Process and store synced data
    logger.info(`Processing synced data for user ${userId}: ${crmType}`);
  }

  startPeriodicSync(): void {
    // Start global sync job (every hour)
    cron.schedule('0 * * * *', async () => {
      logger.info('Starting periodic CRM sync...');
      // TODO: Sync all configured CRMs
    });
    
    logger.info('Periodic CRM sync started');
  }

  stopUserSync(userId: string, crmType: CRMType): void {
    const jobKey = `${userId}-${crmType}`;
    const job = this.syncJobs.get(jobKey);
    
    if (job) {
      job.stop();
      this.syncJobs.delete(jobKey);
      logger.info(`Sync job stopped for user ${userId}: ${crmType}`);
    }
  }
}