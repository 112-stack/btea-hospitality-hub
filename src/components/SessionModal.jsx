import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SessionModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [sessionTimer, setSessionTimer] = useState(null);
  const [modalTimer, setModalTimer] = useState(null);

  const TIME_WARNING = 300; // 5 minutes in seconds
  const SESSION_TIMEOUT = 1845; // Total session timeout
  const HEARTBEAT_INTERVAL = 60; // 60 seconds

  // Format countdown time
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  // Keep session alive
  const keepSessionAlive = useCallback(async () => {
    try {
      await axios.post('/Main/KeepSessionAlive', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Failed to keep session alive:', error);
    }
  }, []);

  // Start session countdown
  const startSessionCountdown = useCallback(() => {
    let timeLeft = SESSION_TIMEOUT - TIME_WARNING;

    const timer = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timer);
        setShowModal(true);
        setCountdown(TIME_WARNING);
      } else {
        timeLeft--;
      }
    }, 1000);

    setSessionTimer(timer);
  }, []);

  // Start modal countdown
  useEffect(() => {
    if (showModal) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = '/Login/signout';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setModalTimer(timer);

      return () => clearInterval(timer);
    }
  }, [showModal]);

  // Extend session handler
  const handleExtendSession = async () => {
    await keepSessionAlive();
    setShowModal(false);
    setCountdown(TIME_WARNING);

    // Clear existing timers
    if (sessionTimer) clearInterval(sessionTimer);
    if (modalTimer) clearInterval(modalTimer);

    // Restart session countdown
    startSessionCountdown();
  };

  // Sign out handler
  const handleSignOut = () => {
    window.location.href = '/Login/signout';
  };

  // Initialize on component mount
  useEffect(() => {
    startSessionCountdown();

    // Setup heartbeat
    const heartbeat = setInterval(keepSessionAlive, HEARTBEAT_INTERVAL * 1000);

    return () => {
      if (sessionTimer) clearInterval(sessionTimer);
      if (modalTimer) clearInterval(modalTimer);
      clearInterval(heartbeat);
    };
  }, []);

  return (
    <>
      {showModal && (
        <div
          className="modal show d-block"
          id="sessionModal"
          tabIndex="-1"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  Session Timeout Warning
                </h5>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <i className="fa fa-clock fa-3x text-warning"></i>
                </div>
                <p className="text-center">
                  Your session is about to expire in{' '}
                  <strong className="text-danger fs-4">{formatTime(countdown)}</strong> minutes!
                </p>
                <p className="text-center mb-0">
                  Do you want to extend your session?
                </p>
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleSignOut}
                >
                  <i className="fa fa-sign-out me-2"></i>
                  Sign Out
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleExtendSession}
                >
                  <i className="fa fa-refresh me-2"></i>
                  Extend Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionModal;
