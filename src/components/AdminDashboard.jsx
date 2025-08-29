import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Trash2, Eye, CheckCircle, Clock, AlertTriangle, UserPlus, Settings, BarChart3, Download, Heart, Calendar, Star, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import MedicineRequestManagement from './MedicineRequestManagement';
import DailyUpdates from './DailyUpdates';
import AdminReviews from './AdminReviews';
import AdminPaymentManagement from './AdminPaymentManagement';
import AdminRevenueManagement from './AdminRevenueManagement';
import AdminDisputeManagement from './AdminDisputeManagement';
import AdminSupportManagement from './AdminSupportManagement';
import TopBar from './TopBar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [stats, setStats] = useState({ users: {}, support: {}, requests: {} });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const { user, getAuthHeaders } = useAuth();
  const { success, error, warning, showConfirm } = useNotification();

  // New state for enhanced admin features
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    role: 'customer'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Don't fetch if user is not logged in or no token
    if (!user || !localStorage.getItem('token')) {
      return;
    }
    
    try {
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      
      // Fetch users
      const usersResponse = await fetch('/api/users', { headers });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        // Ensure role property exists for each user
        const processedUsers = usersData.map(user => ({
          ...user,
          role: user.role || 'customer' // Default to customer if role is missing
        }));
        setUsers(processedUsers);
      }

      // Fetch medicine requests
      const requestsResponse = await fetch('http://localhost:5000/api/medicine-requests/all', { headers });
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setMedicineRequests(requestsData);
        // Update stats
        const stats = {
          total: requestsData.length,
          pending: requestsData.filter(r => r.status === 'pending').length,
          approved: requestsData.filter(r => r.status === 'approved').length,
          rejected: requestsData.filter(r => r.status === 'rejected').length
        };
        setStats(prev => ({ ...prev, requests: stats }));
      }

      // Fetch support tickets
      const ticketsResponse = await fetch('/api/support', { headers });
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setSupportTickets(ticketsData);
      }

      // Fetch stats
      const userStatsResponse = await fetch('/api/users/stats', { headers });
      const supportStatsResponse = await fetch('/api/support/stats', { headers });
      
      if (userStatsResponse.ok && supportStatsResponse.ok) {
        const userStats = await userStatsResponse.json();
        const supportStats = await supportStatsResponse.json();
        setStats({ users: userStats, support: supportStats });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

    const toggleUserStatus = async (userId, currentStatus) => {
      if (!user || !localStorage.getItem('token')) {
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ isActive: !currentStatus })
        });

        if (response.ok) {
          setUsers(users.map(u => 
            u.id === userId ? { ...u, isActive: !currentStatus } : u
          ));
          success(`✅ User status ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } else {
          const errorData = await response.json();
          error(`❌ ${errorData.message}`);
        }
      } catch (err) {
        error('❌ Error updating user status. Please try again.');
      }
    };

    const handleDeleteUser = async (userId) => {
      // Don't make API calls if user is not logged in or no token
      if (!user || !localStorage.getItem('token')) {
        return;
      }
      
      const confirmed = await showConfirm(
      '🗑️ Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      { confirmText: 'Delete', cancelText: 'Cancel', type: 'error' }
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        success('✅ User deleted successfully');
        fetchData(); // Refresh stats
      } else {
        const errorData = await response.json();
        error(`❌ ${errorData.message}`);
      }
    } catch (err) {
      error('❌ Error deleting user. Please try again.');
    }
  };

  const handleUpdateTicket = async (ticketId, status, response) => {
    if (!user || !localStorage.getItem('token')) {
      return;
    }
    
    try {
      const updateResponse = await fetch(`/api/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status, adminResponse: response })
      });

      if (updateResponse.ok) {
        fetchData();
        setSelectedTicket(null);
        setAdminResponse('');
        success('✅ Ticket updated successfully');
      }
    } catch (err) {
      error('❌ Error updating ticket. Please try again.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!user || !localStorage.getItem('token')) {
      return;
    }
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newUserData)
      });

      if (response.ok) {
        setNewUserData({
          email: '',
          phone: '',
          password: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          role: 'customer'
        });
        setShowCreateUser(false);
        fetchData();
        success('✅ User created successfully');
      } else {
        const errorData = await response.json();
        error(`❌ ${errorData.message}`);
      }
    } catch (err) {
      error('❌ Error creating user. Please try again.');
    }
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Role,Gender,Status,Created Date\n"
      + users.map(user => 
          `"${user.firstName} ${user.lastName}","${user.email}","${user.phone}","${user.role}","${user.gender}","${user.isActive ? 'Active' : 'Inactive'}","${new Date(user.createdAt).toLocaleDateString()}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medsy_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-red-100 text-red-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Top Bar */}
      <TopBar 
        title="MedZy Admin Dashboard" 
        subtitle="Comprehensive system management and analytics"
      />

      {/* Quick Action Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateUser(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors flex items-center space-x-2 font-medium"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={exportUsers}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-colors flex items-center space-x-2 font-medium"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Support Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.support.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.support.open || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Complaints</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.support.complaints || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'support'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Support Tickets
            </button>
            <button
              onClick={() => setActiveTab('medicine-requests')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'medicine-requests'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Heart className="h-4 w-4 inline mr-2" />
              Medicine Requests
            </button>
            <button
              onClick={() => setActiveTab('daily-updates')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'daily-updates'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Daily Updates
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <CreditCard className="h-4 w-4 inline mr-2" />
              Payments
            </button>

            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'disputes'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Disputes
            </button>
            
            <button
              onClick={() => setActiveTab('enhanced-support')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'enhanced-support'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Enhanced Support
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Star className="h-4 w-4 inline mr-2" />
              Reviews
            </button>

          </div>
        </div>

        <div className="p-6">
          {activeTab === 'enhanced-support' && <AdminSupportManagement />}
          {activeTab === 'disputes' && <AdminDisputeManagement />}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Users ({users.length})</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add User</span>
                  </button>
                  <button
                    onClick={exportUsers}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 dark:bg-green-500 dark:hover:bg-green-600"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                      <th className="text-left pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                      <th className="text-left pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Phone</th>
                      <th className="text-left pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Role</th>
                      <th className="text-left pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Gender</th>
                      <th className="text-left pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                      <th className="text-left pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Created</th>
                      <th className="text-right pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="py-3 text-sm text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{user.phone}</td>
                        <td className="py-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize dark:bg-blue-900 dark:text-blue-200">
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">{user.gender}</td>
                        <td className="py-3">
                          {user.role === 'admin' ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Always Active
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                              }`}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </button>
                          )}
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right flex justify-end space-x-2">
                          {user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => toggleUserStatus(user.id, user.isActive)}
                                className={`p-1 rounded transition-colors ${
                                  user.isActive 
                                    ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900' 
                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900'
                                }`}
                                title={user.isActive ? "Deactivate User" : "Activate User"}
                              >
                                {user.isActive ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'medicine-requests' && (
            <div className="p-6">
              <MedicineRequestManagement />
            </div>
          )}

          {activeTab === 'daily-updates' && (
            <div className="p-0">
              <DailyUpdates />
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="p-0">
              <AdminPaymentManagement />
            </div>
          )}


          {activeTab === 'revenue' && (
            <div className="p-0">
              <AdminRevenueManagement />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="p-0">
              <AdminReviews />
            </div>
          )}

          {activeTab === 'support' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Support Tickets ({supportTickets.length})</h3>
                <div className="flex space-x-2">
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                    <option>All Status</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                    <option>All Types</option>
                    <option>Complaint</option>
                    <option>Help</option>
                    <option>Suggestion</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{ticket.subject}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {ticket.type} • Customer ID: {ticket.customerId}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{ticket.message}</p>
                    
                    {ticket.adminResponse && (
                      <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Admin Response:</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{ticket.adminResponse}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50"
                        >
                          Respond
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center space-x-3 mb-6">
              <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New User</h3>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={newUserData.dateOfBirth}
                  onChange={(e) => setNewUserData({...newUserData, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select
                    required
                    value={newUserData.gender}
                    onChange={(e) => setNewUserData({...newUserData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="customer">Customer</option>
                    <option value="pharmacy_vendor">Pharmacy Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Respond to Ticket</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                defaultValue={selectedTicket.status}
                onChange={(e) => setSelectedTicket({...selectedTicket, status: e.target.value})}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your response..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setAdminResponse('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateTicket(selectedTicket.id, selectedTicket.status, adminResponse)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;