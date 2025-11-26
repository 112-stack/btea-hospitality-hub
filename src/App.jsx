import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SessionModal from './components/SessionModal';
import OutletForm from './components/OutletForm';
import EmailManagement from './pages/EmailManagement';

// Outlet Management Component (existing functionality)
const OutletManagement = () => {
  const navigate = useNavigate();
  const [showOutletForm, setShowOutletForm] = useState(false);
  const [editMode, setEditMode] = useState('create');
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [outlets, setOutlets] = useState([]);

  // Initialize from server data if available
  useEffect(() => {
    if (window.outletData) {
      setOutlets(window.outletData.processingOutlets || []);
    }
  }, []);

  const handleCreateOutlet = () => {
    setEditMode('create');
    setSelectedOutlet(null);
    setShowOutletForm(true);
  };

  const handleEditOutlet = (outlet) => {
    setEditMode('edit');
    setSelectedOutlet(outlet);
    setShowOutletForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Submit to server
      const response = await fetch('/EditOutlet/doUpdate', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Update local state
        if (editMode === 'create') {
          const newOutlet = Object.fromEntries(formData);
          setOutlets(prev => [...prev, newOutlet]);
        } else {
          // Update existing outlet
          setOutlets(prev =>
            prev.map(outlet =>
              outlet.id === selectedOutlet?.id
                ? { ...outlet, ...Object.fromEntries(formData) }
                : outlet
            )
          );
        }

        setShowOutletForm(false);
        alert('Outlet saved successfully!');
      } else {
        alert('Failed to save outlet. Please try again.');
      }
    } catch (error) {
      console.error('Error saving outlet:', error);
      alert('An error occurred while saving the outlet.');
    }
  };

  const handleFormCancel = () => {
    setShowOutletForm(false);
    setSelectedOutlet(null);
  };

  const handleDeleteOutlet = (outletId) => {
    if (confirm('Are you sure you want to delete this outlet?')) {
      setOutlets(prev => prev.filter(outlet => outlet.id !== outletId));
    }
  };

  return (
    <div className="main p-3">
      {/* Session Modal */}
      <SessionModal />

      {/* Quick Navigation to Email Management */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/email')}
          className="btn btn-outline-primary"
        >
          <i className="fa fa-envelope me-2"></i>
          Go to Email Template Management
        </button>
      </div>

      {/* Content Header */}
      <div className="content-header">
        <h1>Edit Outlet</h1>
        <hr />
      </div>

      <br />

      {/* Processing Outlets Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header border-0 bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Processing Outlets</h4>
            <button
              className="btn btn-primary"
              onClick={handleCreateOutlet}
            >
              <i className="fa fa-plus me-2"></i>
              Add New Outlet
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Outlet Name (EN)</th>
                  <th>Outlet Name (AR)</th>
                  <th>Outlet Status</th>
                  <th>Outlet Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {outlets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      <i className="fa fa-info-circle me-2"></i>
                      No outlets added yet. Click "Add New Outlet" to get started.
                    </td>
                  </tr>
                ) : (
                  outlets.map((outlet, index) => (
                    <tr key={outlet.id || index}>
                      <td>{outlet.name}</td>
                      <td>{outlet.arabic_name}</td>
                      <td>
                        <span className={`badge ${
                          outlet.status === 'New' ? 'bg-success' :
                          outlet.status === 'Edit' ? 'bg-warning' :
                          'bg-secondary'
                        }`}>
                          {outlet.status || 'Pending'}
                        </span>
                      </td>
                      <td>{outlet.typestr || 'N/A'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEditOutlet(outlet)}
                          title="Edit"
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteOutlet(outlet.id)}
                          title="Delete"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Help Documentation */}
      <hr />
      <div className="mb-3">
        <a target="_blank" href="/Content/docs/Hotels Classification Decree.pdf">
          <u>Resolution No. (4) 2015, regarding classification of hotels, hotel apartments, catering and beverage services in hotels.</u>
        </a>
      </div>

      <br />

      {/* Submit Button */}
      {outlets.length > 0 && (
        <div className="row">
          <div className="text-center">
            <button
              id="submission_button"
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '300px' }}
              onClick={() => {
                if (confirm('Are you sure you want to submit all outlet changes?')) {
                  document.getElementById('outletUpdateForm')?.submit();
                }
              }}
            >
              <i className="fa fa-check me-2"></i>
              Submit All Changes
            </button>
          </div>
        </div>
      )}

      {/* Outlet Form Modal */}
      {showOutletForm && (
        <OutletForm
          mode={editMode}
          initialData={selectedOutlet}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      <br /><br />
    </div>
  );
};

// Main App Component with Routing
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OutletManagement />} />
        <Route path="/email/*" element={<EmailManagement />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
