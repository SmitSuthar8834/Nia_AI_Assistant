import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your profile information
        </p>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <div className="text-gray-500">Profile Settings coming soon...</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;