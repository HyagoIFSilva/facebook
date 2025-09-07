import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import NewsFeed from "./components/NewsFeed";
import ProfileEnhanced from "./components/ProfileEnhanced";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return <NewsFeed />;
      case 'profile':
        return <ProfileEnhanced />;
      case 'friends':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Friends</h2>
              <p className="text-gray-600">Friend management features coming soon!</p>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
              <p className="text-gray-600">Messaging features coming soon!</p>
            </div>
          </div>
        );
      case 'groups':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Groups</h2>
              <p className="text-gray-600">Group features coming soon!</p>
            </div>
          </div>
        );
      case 'marketplace':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketplace</h2>
              <p className="text-gray-600">Marketplace features coming soon!</p>
            </div>
          </div>
        );
      default:
        return <NewsFeed />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/*" 
            element={
              <>
                <Header activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex">
                  <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                  <main className="flex-1 p-4">
                    {renderMainContent()}
                  </main>
                  <RightSidebar />
                </div>
                <Toaster />
              </>
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;