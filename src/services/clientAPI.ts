// src/services/clientAPI.ts
const API_BASE = '/api';

// Helper function for authenticated requests
const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json',
});

export const clientAPI = {
  // Get current user info
  getCurrentUser: () => 
    fetch(`${API_BASE}/auth/user/`, {
      headers: authHeaders()
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    }),

  // Get all tasks for the current client
  getTasks: () => 
    fetch(`${API_BASE}/tasks/`, {
      headers: authHeaders()
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    }),

  // Get specific task details
  getTask: (taskId: string) => 
    fetch(`${API_BASE}/tasks/${taskId}/`, {
      headers: authHeaders()
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch task');
      return res.json();
    }),

  // Create new task
  createTask: (formData: FormData) => {
    return fetch(`${API_BASE}/tasks/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        // DO NOT set Content-Type! Let browser set multipart boundary
      },
      body: formData,
    }).then(res => {
      if (!res.ok) {
        return res.text().then(text => {
          throw new Error(text || 'Failed to create task');
        });
      }
      return res.json();
    });
  },

  // Get chat messages for a task
  getChatMessages: (taskId: string) =>
    fetch(`${API_BASE}/tasks/${taskId}/chat/`, {
      headers: authHeaders()
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    }),

  // Send chat message (handles both text and files)
  sendMessage: (taskId: string, message: string | FormData) => {
    const isFormData = message instanceof FormData;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const body = isFormData ? message : JSON.stringify({ message });
    
    return fetch(`${API_BASE}/tasks/${taskId}/chat/`, {
      method: 'POST',
      headers,
      body,
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },

  // Get notifications
  getNotifications: () =>
    fetch(`${API_BASE}/notifications/`, {
      headers: authHeaders()
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    }),

  // Mark notification as read
  markNotificationRead: (notificationId: string) =>
    fetch(`${API_BASE}/notifications/${notificationId}/read/`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to mark notification read');
      return res.json();
    }),

  // Budget negotiation functions
  acceptBudget: (taskId: string) => {
    return fetch(`${API_BASE}/tasks/${taskId}/accept-budget/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },

  counterBudget: (taskId: string, amount: number) => {
    return fetch(`${API_BASE}/tasks/${taskId}/counter-budget/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },

  rejectBudget: (taskId: string) => {
    return fetch(`${API_BASE}/tasks/${taskId}/reject-budget/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },

  withdrawTask: (taskId: string, reason: string) => {
    return fetch(`${API_BASE}/tasks/${taskId}/withdraw/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },

  // Download file
  downloadFile: async (fileId: string) => {
    const response = await fetch(`${API_BASE}/files/${fileId}/download/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
    
    return response.blob();
  },

  approveTask: (taskId: string) => {
    return fetch(`${API_BASE}/tasks/${taskId}/approve/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },

  requestRevision: (taskId: string, reason: string) => {
    return fetch(`${API_BASE}/tasks/${taskId}/request-revision/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason }),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },
};