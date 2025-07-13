const cron = require('node-cron');
const StreakService = require('./streakService.js');

class Scheduler {
  constructor() {
    this.jobs = [];
  }

  // Initialize all scheduled jobs
  init() {
    console.log('🚀 Initializing scheduled jobs...');
    
    // Reset inactive streaks daily at 2 AM
    this.scheduleStreakReset();
    
    // Update global stats daily at 3 AM
    this.scheduleStatsUpdate();
    
    // Clean up old data weekly
    this.scheduleCleanup();
    
    console.log('✅ Scheduled jobs initialized');
  }

  // Schedule streak reset job
  scheduleStreakReset() {
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🔄 Running daily streak reset...');
        const resetCount = await StreakService.resetInactiveStreaks();
        console.log(`✅ Reset streaks for ${resetCount} inactive users`);
      } catch (error) {
        console.error('❌ Error in streak reset job:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    job.start();
    this.jobs.push({ name: 'streak-reset', job });
    console.log('📅 Scheduled streak reset job (daily at 2 AM UTC)');
  }

  // Schedule stats update job
  scheduleStatsUpdate() {
    const job = cron.schedule('0 3 * * *', async () => {
      try {
        console.log('📊 Updating global stats...');
        const stats = await StreakService.getStreakStats();
        console.log('✅ Global stats updated:', stats);
      } catch (error) {
        console.error('❌ Error in stats update job:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    job.start();
    this.jobs.push({ name: 'stats-update', job });
    console.log('📅 Scheduled stats update job (daily at 3 AM UTC)');
  }

  // Schedule cleanup job
  scheduleCleanup() {
    const job = cron.schedule('0 4 * * 0', async () => {
      try {
        console.log('🧹 Running weekly cleanup...');
        // Add cleanup logic here if needed
        console.log('✅ Weekly cleanup completed');
      } catch (error) {
        console.error('❌ Error in cleanup job:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    job.start();
    this.jobs.push({ name: 'cleanup', job });
    console.log('📅 Scheduled cleanup job (weekly on Sunday at 4 AM UTC)');
  }

  // Stop all scheduled jobs
  stop() {
    console.log('🛑 Stopping all scheduled jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`⏹️ Stopped ${name} job`);
    });
    this.jobs = [];
  }

  // Get job status
  getStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: job.running
    }));
  }
}

module.exports = new Scheduler(); 