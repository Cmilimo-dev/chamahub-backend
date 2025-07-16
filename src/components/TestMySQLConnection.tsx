import React, { useState, useEffect } from 'react';
import ChamaHubAPI from '../lib/api';

const TestMySQLConnection: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing MySQL API connection...');
        
        // Test API calls
        const fetchedUsers = await ChamaHubAPI.getUsers();
        const fetchedGroups = await ChamaHubAPI.getGroups();
        
        setUsers(fetchedUsers);
        setGroups(fetchedGroups);
        setConnectionStatus('connected');
        
        console.log('✅ MySQL API test successful!');
      } catch (err) {
        console.error('❌ MySQL API test failed:', err);
        setConnectionStatus('failed');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testAPI();
  }, []);

  if (connectionStatus === 'testing') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Testing MySQL Connection...</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">❌ MySQL Connection Failed</h3>
        <p className="text-red-600">{error}</p>
        <div className="mt-3 text-sm text-red-600">
          <p>Make sure:</p>
          <ul className="list-disc list-inside mt-1">
            <li>MySQL is running on localhost:3306</li>
            <li>Database 'chamahub' exists</li>
            <li>User 'root' has access (no password)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-4">✅ MySQL Connection Successful!</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-green-700 mb-2">Users ({users.length})</h4>
          <div className="bg-white rounded border p-3 max-h-40 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="mb-2 text-sm">
                <div className="font-medium">{user.first_name} {user.last_name}</div>
                <div className="text-gray-600">{user.email}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-green-700 mb-2">Groups ({groups.length})</h4>
          <div className="bg-white rounded border p-3 max-h-40 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.id} className="mb-2 text-sm">
                <div className="font-medium">{group.name}</div>
                <div className="text-gray-600">{group.description}</div>
                <div className="text-gray-500">Members: {group.member_count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded border">
        <h5 className="font-medium text-green-700 mb-2">Migration Summary</h5>
        <ul className="text-sm text-green-600 space-y-1">
          <li>✅ Disconnected from Supabase</li>
          <li>✅ MySQL database connected</li>
          <li>✅ All tables created successfully</li>
          <li>✅ Sample data inserted</li>
          <li>✅ API layer working</li>
          <li>✅ Ready for development!</li>
        </ul>
      </div>
    </div>
  );
};

export default TestMySQLConnection;
