/**
 * Session Management
 * Handles session timeout warnings and keepalive
 */

const SESSION_CONFIG = {
    TIMEOUT_WARNING: 300,      // 5 minutes warning (in seconds)
    SESSION_TIMEOUT: 1845,     // Total session timeout (in seconds)
    HEARTBEAT_INTERVAL: 60     // Heartbeat every 60 seconds
};

let countdownTimer;
let countdownModalTimer;

/**
 * Start countdown to session warning
 */
function startCountdown() {
    let timeLeft = SESSION_CONFIG.SESSION_TIMEOUT - SESSION_CONFIG.TIMEOUT_WARNING;

    countdownTimer = setInterval(function() {
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            showSessionModal();
            startModalCountdown();
        } else {
            timeLeft--;
        }
    }, 1000);
}

/**
 * Start modal countdown
 */
function startModalCountdown() {
    let modalTimeLeft = SESSION_CONFIG.TIMEOUT_WARNING;

    countdownModalTimer = setInterval(function() {
        if (modalTimeLeft <= 0) {
            clearInterval(countdownModalTimer);
            window.location.href = "/Login/signout";
        } else {
            const minutes = Math.floor(modalTimeLeft / 60);
            let seconds = modalTimeLeft % 60;

            if (seconds < 10) {
                seconds = "0" + seconds;
            }

            $('#countdown').text(`${minutes}:${seconds}`);
            modalTimeLeft--;
        }
    }, 1000);
}

/**
 * Show session timeout modal
 */
function showSessionModal() {
    const modal = new bootstrap.Modal(document.getElementById('sessionModal'));
    modal.show();
}

/**
 * Extend session
 */
function extendSession() {
    $.ajax({
        type: "POST",
        url: "/Main/KeepSessionAlive",
        xhrFields: { withCredentials: true },
        success: function() {
            clearInterval(countdownModalTimer);

            const modal = bootstrap.Modal.getInstance(document.getElementById('sessionModal'));
            if (modal) {
                modal.hide();
            }

            startCountdown();
        },
        error: function(xhr, status, error) {
            console.error('Failed to extend session:', error);
        }
    });
}

/**
 * Send heartbeat to keep session alive
 */
function sendHeartbeat() {
    setInterval(function() {
        $.ajax({
            type: "POST",
            url: "/Main/KeepSessionAlive",
            xhrFields: { withCredentials: true },
            error: function(xhr, status, error) {
                console.error('Heartbeat failed:', error);
            }
        });
    }, SESSION_CONFIG.HEARTBEAT_INTERVAL * 1000);
}

/**
 * Initialize session management
 */
$(document).ready(function() {
    // Start countdown
    startCountdown();

    // Start heartbeat
    sendHeartbeat();

    // Extend session button
    $('#extendSessionButton').on('click', function() {
        extendSession();
    });

    // Sign out button
    $('#signOutButton').on('click', function() {
        window.location.href = "/Login/signout";
    });
});

/**
 * Create session modal if it doesn't exist
 */
$(document).ready(function() {
    if ($('#sessionModal').length === 0) {
        const modalHtml = `
            <div class="modal fade" id="sessionModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Session Timeout Warning</h5>
                        </div>
                        <div class="modal-body">
                            <p>Your session is about to expire in <strong><span id="countdown">5:00</span></strong> minutes!</p>
                            <p>Would you like to extend your session?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-danger" id="signOutButton">Sign Out</button>
                            <button type="button" class="btn btn-success" id="extendSessionButton">Extend Session</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(modalHtml);
    }
});
