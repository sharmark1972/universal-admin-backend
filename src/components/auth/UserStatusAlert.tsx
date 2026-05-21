'use client';

import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Ban, X } from 'lucide-react';
import { useState } from 'react';

const UserStatusAlert = () => {
  const { isBanned, hasWarning, getBannedReason, getWarningMessage } = useAuth();
  const [showWarning, setShowWarning] = useState(true);

  if (isBanned()) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Ban className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Account Banned
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Your account has been banned. Reason: {getBannedReason()}
              </p>
              <p className="mt-1">
                Please contact the administrator for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasWarning() && showWarning) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Account Warning
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>{getWarningMessage()}</p>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={() => setShowWarning(false)}
                className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UserStatusAlert;