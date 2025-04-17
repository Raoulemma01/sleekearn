import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, runTransaction, serverTimestamp, increment } from 'firebase/firestore';
import './TaskSystem.css';

const DAILY_TASKS = [
  {
    id: 'task1',
    title: 'Watch Video 1',
    link: 'https://youtube.com/your-video-1',
    points: 350
  },
  {
    id: 'task2',
    title: 'Watch Video 2',
    link: 'https://youtube.com/your-video-2',
    points: 350
  }
];

const TaskSystem = () => {
  const { currentUser } = useAuth();
  const [taskStatus, setTaskStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get today's date in ISO format (YYYY-MM-DD)
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const checkTaskCompletion = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const completedTasks = userDoc.data()?.completedTasks || {};
        const today = getTodayDate();

        const status = DAILY_TASKS.reduce((acc, task) => {
          acc[task.id] = completedTasks[task.id] === today;
          return acc;
        }, {});

        setTaskStatus(status);
      } catch (error) {
        console.error("Error fetching task status:", error);
        setError('Failed to load tasks. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    checkTaskCompletion();
  }, [currentUser]);

  const handleCompleteTask = async (taskId) => {
    if (!currentUser?.uid || taskStatus[taskId]) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const today = getTodayDate();

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const completedTasks = userDoc.data()?.completedTasks || {};

        if (completedTasks[taskId] === today) {
          throw new Error('Task already completed today');
        }

        transaction.update(userRef, {
          [`completedTasks.${taskId}`]: today,
          'balances.task': increment(350),
          'balances.total': increment(350),
          lastUpdated: serverTimestamp()
        });
      });

      setTaskStatus(prev => ({ ...prev, [taskId]: true }));
      setError('');
    } catch (error) {
      console.error("Transaction error:", error);
      setError(error.message || 'Failed to complete task. Please try again.');
    }
  };
  

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-system">
      <h2>Daily Tasks</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="task-grid">
        {DAILY_TASKS.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-box">
              <h3>{task.title}</h3>
              <p>Earn {task.points} points</p>
            </div>
            
            <div className="task-actions">
              <a 
                href={task.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="task-button perform-button"
              >
                Perform Task
              </a>
              
              {!taskStatus[task.id] ? (
                <button 
                  className="task-button complete-button"
                  onClick={() => handleCompleteTask(task.id)}
                >
                  Mark as Completed
                </button>
              ) : (
                <div className="completed-text">
                  ✅ Completed! +{task.points} points
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSystem;