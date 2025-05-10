import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import storageService, { StorageBackend, StorageConfig } from '../../services/storageService';

// Simple UI components for the form
const Label: React.FC<{htmlFor: string; children: React.ReactNode}> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-bread-brown-700 mb-1">{children}</label>
);

const Input: React.FC<{
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}> = ({ id, value, onChange, placeholder, className = '', type = 'text' }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`px-3 py-2 border border-bread-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-brown-500 ${className}`}
  />
);

const Select: React.FC<{
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  children: React.ReactNode;
}> = ({ id, value, onChange, className = '', children }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className={`px-3 py-2 border border-bread-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-brown-500 ${className}`}
  >
    {children}
  </select>
);

const StorageConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<StorageConfig>(storageService.getConfig());
  const [apiKey, setApiKey] = useState<string>(config.apiKey || '');
  const [remoteUrl, setRemoteUrl] = useState<string>(config.remoteUrl || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update the form when the config changes
  useEffect(() => {
    setApiKey(config.apiKey || '');
    setRemoteUrl(config.remoteUrl || '');
  }, [config]);

  const handleBackendChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const backend = e.target.value as StorageBackend;
    setConfig(prev => ({ ...prev, backend }));
  };

  const handleSave = () => {
    const updatedConfig: StorageConfig = {
      ...config,
      apiKey: config.backend === 'remote' ? apiKey : undefined,
      remoteUrl: config.backend === 'remote' ? remoteUrl : undefined
    };
    
    storageService.updateConfig(updatedConfig);
    setConfig(storageService.getConfig());
    
    // Show a success message or notification here
    alert('Storage configuration updated successfully');
  };

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-bread-brown-700">Storage Configuration</h2>
      <p className="text-bread-brown-600 mb-4">
        Choose how your recipes and baking data are stored. Local storage is the default and works offline.
      </p>
      
      <div className="mb-4">
        <Label htmlFor="storageBackend">Storage Type</Label>
        <Select 
          id="storageBackend"
          value={config.backend}
          onChange={handleBackendChange}
          className="w-full"
        >
          <option value="localStorage">Local Storage (Default)</option>
          <option value="sessionStorage">Session Storage (Temporary)</option>
          <option value="indexedDB">IndexedDB (Larger Storage)</option>
          <option value="remote">Remote API (Cloud Storage)</option>
        </Select>
        <p className="text-sm text-bread-brown-500 mt-1">
          {config.backend === 'localStorage' && 'Data is stored in your browser and persists between sessions.'}
          {config.backend === 'sessionStorage' && 'Data is only stored for the current session and will be lost when you close the browser.'}
          {config.backend === 'indexedDB' && 'Data is stored in your browser with larger capacity than localStorage.'}
          {config.backend === 'remote' && 'Data is stored in the cloud and can be accessed from multiple devices.'}
        </p>
      </div>

      {config.backend === 'remote' && (
        <div className="border-t border-bread-brown-200 pt-4 mt-4">
          <h3 className="text-lg font-medium mb-3 text-bread-brown-700">Remote Storage Settings</h3>
          
          <div className="mb-4">
            <Label htmlFor="remoteUrl">API URL</Label>
            <Input
              id="remoteUrl"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://api.example.com/storage"
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your API key"
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <Button 
          variant="outline" 
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </Button>
        
        <Button 
          variant="primary" 
          onClick={handleSave}
        >
          Save Configuration
        </Button>
      </div>

      {showAdvanced && (
        <div className="border-t border-bread-brown-200 pt-4 mt-4">
          <h3 className="text-lg font-medium mb-3 text-bread-brown-700">Advanced Settings</h3>
          
          <div className="mb-4">
            <Label htmlFor="prefix">Storage Prefix</Label>
            <Input
              id="prefix"
              value={config.prefix || 'breadApp_'}
              onChange={(e) => setConfig(prev => ({ ...prev, prefix: e.target.value }))}
              placeholder="breadApp_"
              className="w-full"
            />
            <p className="text-sm text-bread-brown-500 mt-1">
              Prefix used for storage keys. Changing this will make existing data inaccessible.
            </p>
          </div>

          <div className="mt-4">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => {
                if (confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
                  storageService.clear(true);
                  alert('All data has been cleared');
                  window.location.reload();
                }
              }}
            >
              Clear All Data
            </Button>
            <p className="text-sm text-red-500 mt-1">
              Warning: This will permanently delete all your recipes and baking data.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StorageConfigPanel;
