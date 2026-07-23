import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, GitCommit, ExternalLink, Clock } from 'lucide-react';

interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
    url: string;
  };
  payload: {
    commits: Array<{
      sha: string;
      message: string;
      url: string;
    }>;
  };
}

interface GitHubActivityProps {
  isDark?: boolean;
  username?: string; // e.g., 'your-github-username'
}

export const GitHubActivity = ({ isDark = true, username = 'github' }: GitHubActivityProps) => {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubActivity = async () => {
      try {
        setLoading(true);
        // Using public events endpoint. Note: Unauthenticated requests have rate limits (60/hr).
        const response = await fetch(`https://api.github.com/users/${username}/events/public`);

        if (!response.ok) {
          throw new Error(response.status === 403 ? 'Rate limit exceeded' : 'User not found or API error');
        }

        const data = await response.json();

        // Filter only push events to show commits
        const pushEvents = data
          .filter((event: any) => event.type === 'PushEvent')
          .slice(0, 4); // Get top 4 recent pushes

        setEvents(pushEvents);
      } catch (err: any) {
        console.error('Error fetching GitHub activity:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username && username !== 'your-github-username') {
      fetchGitHubActivity();
    } else {
      setLoading(false);
      setError('Please provide a valid GitHub username.');
    }
  }, [username]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`${isDark
      ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700'
      : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-300'
      } backdrop-blur-sm p-6 md:p-8 rounded-2xl border shadow-xl flex flex-col h-full relative overflow-hidden group`}>

      {/* Background glowing effect */}
      <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-emerald-600' : 'bg-sky-500'} transition-opacity duration-500 group-hover:opacity-40`}></div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800/80 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <Github className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Live Activity
          </h3>
          <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-teal-600'} flex items-center gap-1`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-teal-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-emerald-500' : 'bg-teal-600'}`}></span>
            </span>
            Real-time GitHub Feed
          </p>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-emerald-400' : 'border-teal-600'}`}></div>
            <p className={`text-sm animate-pulse ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Syncing with GitHub...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'} mb-2`}>{error}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Update username in Code
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No recent push events found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50' : 'bg-white/50 border-gray-200 hover:bg-gray-50/80'
                  } transition-colors duration-300`}
              >
                <div className="flex justify-between items-start mb-2">
                  <a
                    href={`https://github.com/${event.repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium flex items-center gap-1 hover:underline ${isDark ? 'text-teal-400' : 'text-teal-600'
                      }`}
                  >
                    {event.repo.name.split('/')[1]}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3" />
                    {formatDate(event.created_at)}
                  </div>
                </div>

                <div className="space-y-2 mt-2 pl-2 border-l-2 border-slate-600/30">
                  {(event.payload.commits || []).slice(0, 2).map((commit) => (
                    <div key={commit.sha} className="flex items-start gap-2">
                      <GitCommit className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-xs line-clamp-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {commit.message}
                      </p>
                    </div>
                  ))}
                  {(event.payload.commits || []).length > 2 && (
                    <p className={`text-xs pl-5 italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      + {(event.payload.commits || []).length - 2} more commits
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className={`mt-6 pt-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-200'} flex justify-between items-center text-xs relative z-10`}>
        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Powered by GitHub API</span>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`hover:underline flex items-center gap-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}
        >
          View Profile
        </a>
      </div>
    </div>
  );
};
