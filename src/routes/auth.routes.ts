// Authentication Routes
import { Router, Request, Response } from 'express';
import { executeQuery } from '@/utils/database.utils';
import { logger } from '@/utils/logger';

const router = Router();

// Simple login endpoint for UI testing
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    logger.info('Login attempt:', { email });
    
    // For now, just check if user exists (we'll add proper auth later)
    const result = await executeQuery(
      `SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    const user = result.rows[0];
    
    // Simple password check (we'll add bcrypt later)
    if (email === 'admin@nia.com' && password === 'admin123') {
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role_name
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
      return;
    }
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get current user info
router.get('/me', async (_req: Request, res: Response): Promise<void> => {
  try {
    // For testing, return admin user info
    const result = await executeQuery(
      `SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = 'admin@nia.com'`
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role_name
        }
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [usersResult, rolesResult, permissionsResult, tablesResult] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM users'),
      executeQuery('SELECT COUNT(*) as count FROM roles'),
      executeQuery('SELECT COUNT(*) as count FROM permissions'),
      executeQuery(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`)
    ]);
    
    res.json({
      success: true,
      stats: {
        total_users: parseInt(usersResult.rows[0].count),
        total_roles: parseInt(rolesResult.rows[0].count),
        total_permissions: parseInt(permissionsResult.rows[0].count),
        total_tables: parseInt(tablesResult.rows[0].count),
        database_status: 'Connected',
        system_health: 'Healthy'
      }
    });
    
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;