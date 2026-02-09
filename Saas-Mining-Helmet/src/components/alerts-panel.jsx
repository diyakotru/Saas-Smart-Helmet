'use client'

import { Card } from "../components/ui/card";

export default function AlertsPanel({ alertList = [] }) {

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getSeverityClasses = (severity) => {
    if (severity === 'danger') {
      return {
        bg: 'bg-red-900/20',
        border: 'border-red-600',
        text: 'text-red-400',
        dot: 'bg-red-500 animate-pulse-slow',
        shadow: 'shadow-lg shadow-red-900/50',
        animation: 'animate-slide-in-alert',
      };
    }
    return {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-600',
      text: 'text-yellow-400',
      dot: 'bg-yellow-500',
      shadow: 'shadow-lg shadow-yellow-900/30',
      animation: 'animate-slide-in-alert',
    };
  };

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar animate-fade-in-up">
      {alertList && alertList.length > 0 ? (
        alertList.map((alert) => {
          const classes = getSeverityClasses(alert.severity);
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all duration-300 ${classes.bg} ${classes.border} ${classes.shadow} ${classes.animation}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${classes.dot}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${classes.text} uppercase`}>
                      {alert.type} Alert
                    </h4>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <Card className="p-8 bg-gray-900 border border-gray-800 text-center animate-pulse-subtle">
          <p className="text-gray-500 text-sm">No critical alerts at this time</p>
        </Card>
      )}
    </div>
  );
}
