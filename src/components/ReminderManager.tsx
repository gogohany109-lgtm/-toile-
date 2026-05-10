import { useEffect } from 'react';
import { useAuth } from '../components/FirebaseProvider';

export function ReminderManager() {
  const { userData } = useAuth();
  
  useEffect(() => {
    if (!userData?.learningGoals?.reminders) return;
    
    const checkReminders = () => {
      const reminders = userData.learningGoals.reminders;
      if (!Array.isArray(reminders)) return;

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      reminders.forEach((r: { time: string, activity: string }) => {
        if (r.time === currentTime) {
          // In-app alert
          alert(`حان وقت الممارسة! حان وقت: ${r.activity}`);
        }
      });
    };
    
    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [userData]);
  
  return null;
}
