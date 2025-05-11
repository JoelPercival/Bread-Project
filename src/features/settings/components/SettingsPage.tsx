import React from 'react';
import Layout from '../../../components/Layout/Layout';
import StorageConfigPanel from './StorageConfig';
import Card from '../../../components/UI/Card';

const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-bread-brown-800 mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <StorageConfigPanel />
          
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-bread-brown-700">PWA Settings</h2>
            <p className="text-bread-brown-600 mb-4">
              This application can be installed as a Progressive Web App (PWA) for offline use.
            </p>
            
            <div className="bg-bread-brown-50 p-4 rounded-md border border-bread-brown-200">
              <h3 className="font-medium text-bread-brown-700 mb-2">Offline Capabilities</h3>
              <p className="text-bread-brown-600 mb-2">
                When installed as a PWA, this application will:
              </p>
              <ul className="list-disc pl-5 text-bread-brown-600">
                <li>Work without an internet connection</li>
                <li>Store your recipes locally</li>
                <li>Sync data when you're back online (if using remote storage)</li>
                <li>Provide a native app-like experience</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
