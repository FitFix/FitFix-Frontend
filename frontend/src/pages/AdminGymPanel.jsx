import React, { useState, useEffect } from 'react';
import { Users, Shield, TrendingUp, AlertTriangle, Briefcase, Search, Trash2, CalendarPlus, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

export default function AdminGymPanel() {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'expired', 'trainers'
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [entryAlert, setEntryAlert] = useState(null);
  const [gymId, setGymId] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setGymId(user.gymId);

      const [membersRes, trainersRes] = await Promise.all([
        fetch(`http://localhost:5000/api/admin/members?gymId=${user.gymId}`),
        fetch(`http://localhost:5000/api/admin/trainers?gymId=${user.gymId}`)
      ]);

      if (membersRes.ok) {
        setMembers(await membersRes.json());
      } else {
        throw new Error('Backend members fetch failed');
      }
      if (trainersRes.ok) {
        setTrainers(await trainersRes.json());
      } else {
        throw new Error('Backend trainers fetch failed');
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock data for testing.', err);
      let mockMembers = JSON.parse(localStorage.getItem('mockMembers'));
      if (!mockMembers) {
        mockMembers = [
          { _id: 'm1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', subscriptionExpiry: new Date(Date.now() + 864000000 * 3).toISOString(), attendanceLog: [new Date().toISOString()] },
          { _id: 'm2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', subscriptionExpiry: new Date(Date.now() - 864000000).toISOString(), attendanceLog: [] },
          { _id: 'm3', name: 'Expiring Soon User', email: 'soon@example.com', phone: '555-0103', subscriptionExpiry: new Date(Date.now() + 86400000 * 4).toISOString(), attendanceLog: [] }
        ];
        localStorage.setItem('mockMembers', JSON.stringify(mockMembers));
      }
      setMembers(mockMembers);
      
      let mockTrainers = JSON.parse(localStorage.getItem('mockTrainers'));
      if (!mockTrainers) {
        mockTrainers = [{ _id: 't1', name: 'Arnold S.', phone: '555-0199', salary: 5000, attendanceLog: [new Date().toISOString()] }];
        localStorage.setItem('mockTrainers', JSON.stringify(mockTrainers));
      }
      setTrainers(mockTrainers);
    }
  };

  useEffect(() => {
    fetchData();

    // Socket.io connection
    const socket = io('http://localhost:5000');
    socket.on('entry-alert', (data) => {
      setEntryAlert(data);
      if (data.status === 'valid') fetchData(); // Refresh attendance
      setTimeout(() => setEntryAlert(null), 5000);
    });

    return () => socket.disconnect();
  }, []);

  const handleExtendSubscription = async (id, months) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/members/${id}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months })
      });
      if (res.ok) {
        fetchData();
        setSelectedProfile(null);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Mock update
      let mockMembers = JSON.parse(localStorage.getItem('mockMembers')) || [];
      const index = mockMembers.findIndex(m => m._id === id);
      if (index !== -1) {
        let currentExpiry = mockMembers[index].subscriptionExpiry && new Date(mockMembers[index].subscriptionExpiry) > new Date() 
          ? new Date(mockMembers[index].subscriptionExpiry) 
          : new Date();
        currentExpiry.setMonth(currentExpiry.getMonth() + parseInt(months));
        mockMembers[index].subscriptionExpiry = currentExpiry.toISOString();
        localStorage.setItem('mockMembers', JSON.stringify(mockMembers));
        fetchData();
        setSelectedProfile(null);
      }
    }
  };

  const handleSetCustomExpiry = (id, dateStr) => {
    let mockMembers = JSON.parse(localStorage.getItem('mockMembers')) || [];
    const index = mockMembers.findIndex(m => m._id === id);
    if (index !== -1) {
      mockMembers[index].subscriptionExpiry = new Date(dateStr).toISOString();
      localStorage.setItem('mockMembers', JSON.stringify(mockMembers));
      fetchData();
      setSelectedProfile(null);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/members/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      let mockMembers = JSON.parse(localStorage.getItem('mockMembers')) || [];
      mockMembers = mockMembers.filter(m => m._id !== id);
      localStorage.setItem('mockMembers', JSON.stringify(mockMembers));
      fetchData();
    }
  };

  const handleAddNewMember = (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const email = e.target[1].value;
    const phone = e.target[2].value;
    const expiryDate = e.target[3].value;
    
    let mockMembers = JSON.parse(localStorage.getItem('mockMembers')) || [];
    mockMembers.push({
      _id: 'm' + Date.now(),
      name,
      email,
      phone,
      subscriptionExpiry: new Date(expiryDate).toISOString(),
      attendanceLog: []
    });
    localStorage.setItem('mockMembers', JSON.stringify(mockMembers));
    fetchData();
    setShowAddMember(false);
  };

  // Trainer Handlers
  const handleAddTrainer = async (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const phone = e.target[1].value;
    const salary = e.target[2].value;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, salary, gymId })
      });
      if (res.ok) {
        e.target.reset();
        fetchData();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      let mockTrainers = JSON.parse(localStorage.getItem('mockTrainers')) || [];
      mockTrainers.push({
        _id: 't' + Date.now(),
        name,
        phone,
        salary: Number(salary),
        attendanceLog: []
      });
      localStorage.setItem('mockTrainers', JSON.stringify(mockTrainers));
      fetchData();
      e.target.reset();
    }
  };

  const handleDeleteTrainer = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/trainers/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      let mockTrainers = JSON.parse(localStorage.getItem('mockTrainers')) || [];
      mockTrainers = mockTrainers.filter(t => t._id !== id);
      localStorage.setItem('mockTrainers', JSON.stringify(mockTrainers));
      fetchData();
    }
  };

  // Derived state
  const now = new Date();
  const activeMembers = members.filter(m => !m.subscriptionExpiry || new Date(m.subscriptionExpiry) > now);
  const expiredMembers = members.filter(m => m.subscriptionExpiry && new Date(m.subscriptionExpiry) <= now);
  const expiringSoon = activeMembers.filter(m => {
    if (!m.subscriptionExpiry) return false;
    const exp = new Date(m.subscriptionExpiry);
    const diff = exp - now;
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const displayedMembers = activeTab === 'members' 
    ? activeMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    : expiredMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto relative">
      {/* Real-time Alert Popup */}
      <AnimatePresence>
        {entryAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              entryAlert.status === 'valid' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
              entryAlert.status === 'expired' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
              'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
            }`}
          >
            {entryAlert.status === 'valid' ? <Shield size={24} /> : <AlertTriangle size={24} />}
            <span className="font-bold">{entryAlert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gym Owner Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your members and facility</p>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="text-sm text-gray-400 hover:text-white">
          Logout
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm">Active Members</p>
          <div className="flex justify-between items-end mt-2">
            <p className="text-3xl font-bold">{activeMembers.length}</p>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm">Expiring in 7 Days</p>
          <div className="flex justify-between items-end mt-2">
            <p className="text-3xl font-bold text-yellow-500">{expiringSoon.length}</p>
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm">Expired Members</p>
          <div className="flex justify-between items-end mt-2">
            <p className="text-3xl font-bold text-red-500">{expiredMembers.length}</p>
            <Shield className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm">Total Trainers</p>
          <div className="flex justify-between items-end mt-2">
            <p className="text-3xl font-bold text-purple-500">{trainers.length}</p>
            <Briefcase className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
        <button onClick={() => setActiveTab('members')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'members' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>Active Members</button>
        <button onClick={() => setActiveTab('expired')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'expired' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'}`}>Expired</button>
        <button onClick={() => setActiveTab('trainers')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'trainers' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}>Gym Trainers</button>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden min-h-[400px]">
        
        {/* Members & Expired View */}
        {(activeTab === 'members' || activeTab === 'expired') && (
          <div>
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#242424] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button onClick={() => setShowAddMember(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">
                + Add Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#242424] text-left text-xs font-medium text-gray-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {displayedMembers.map((member) => {
                    const isExpiringSoon = member.subscriptionExpiry && new Date(member.subscriptionExpiry) - now > 0 && new Date(member.subscriptionExpiry) - now <= 7 * 24 * 60 * 60 * 1000;
                    return (
                    <tr key={member._id} className="hover:bg-[#242424]/50 transition-colors cursor-pointer" onClick={() => setSelectedProfile({ ...member, type: 'member' })}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                        {member.name}
                        {isExpiringSoon && <AlertTriangle size={16} className="text-yellow-500" title="Expiring within 7 days" />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{member.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {member.subscriptionExpiry ? new Date(member.subscriptionExpiry).toLocaleDateString() : 'Lifetime'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteMember(member._id); }}
                          className="text-red-500 hover:text-red-400 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )})}
                  {displayedMembers.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No members found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trainers View */}
        {activeTab === 'trainers' && (
          <div className="p-6">
            <form onSubmit={handleAddTrainer} className="flex flex-wrap gap-4 mb-8 items-center">
              <input type="text" placeholder="Trainer Name" required className="flex-1 min-w-[200px] bg-[#242424] border border-gray-700 rounded-lg px-4 py-2 focus:border-purple-500" />
              <input type="tel" placeholder="Phone Number" required className="flex-1 min-w-[150px] bg-[#242424] border border-gray-700 rounded-lg px-4 py-2 focus:border-purple-500" />
              <input type="number" placeholder="Salary ($)" required min="0" className="w-32 bg-[#242424] border border-gray-700 rounded-lg px-4 py-2 focus:border-purple-500" />
              <button type="submit" className="bg-purple-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-600">Add Trainer</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainers.map(trainer => (
                <div 
                  key={trainer._id} 
                  onClick={() => setSelectedProfile({ ...trainer, type: 'trainer' })}
                  className="bg-[#242424] p-4 rounded-xl border border-gray-700 flex justify-between items-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Briefcase size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">{trainer.name}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1"><Phone size={12} /> {trainer.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteTrainer(trainer._id); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {trainers.length === 0 && <p className="text-gray-500">No trainers tracked yet.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal (Unified for Members and Trainers) */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#1a1a1a] rounded-2xl border border-gray-800 w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedProfile.type === 'trainer' ? 'Trainer Profile' : 'Member Profile'}</h2>
                <button onClick={() => setSelectedProfile(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      {selectedProfile.name}
                      {selectedProfile.type === 'trainer' && <Briefcase size={16} className="text-purple-500" />}
                    </p>
                  </div>
                  {selectedProfile.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-lg font-semibold">{selectedProfile.phone}</p>
                    </div>
                  )}
                  {selectedProfile.email && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Email ID</p>
                      <p className="text-lg font-semibold">{selectedProfile.email}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-[#242424] rounded-xl border border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">FaceNet AI Tracking Image</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-600">
                      <Users size={24} className="text-gray-500" />
                    </div>
                    <label className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors text-sm font-semibold">
                      Upload Picture
                      <input type="file" className="hidden" accept="image/*" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Uploading an image here extracts the 128-d FaceNet encoding for gym entry tracking.</p>
                </div>

                {selectedProfile.type === 'member' ? (
                  <div className="p-4 bg-[#242424] rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Subscription Management</p>
                    <p className="text-white mb-4 flex items-center gap-2">
                      <span>Expires: <span className="font-bold">{selectedProfile.subscriptionExpiry ? new Date(selectedProfile.subscriptionExpiry).toLocaleDateString() : 'N/A'}</span></span>
                      {selectedProfile.subscriptionExpiry && new Date(selectedProfile.subscriptionExpiry) < new Date() && (
                        <span className="text-red-500 text-sm font-semibold bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                          Expired since {Math.floor((new Date() - new Date(selectedProfile.subscriptionExpiry)) / (1000 * 60 * 60 * 24))} days
                        </span>
                      )}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleExtendSubscription(selectedProfile._id, 1)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg font-semibold hover:bg-blue-500/30">+1 Month</button>
                      <button onClick={() => handleExtendSubscription(selectedProfile._id, 3)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg font-semibold hover:bg-blue-500/30">+3 Months</button>
                      <button onClick={() => handleExtendSubscription(selectedProfile._id, 12)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg font-semibold hover:bg-blue-500/30">+1 Year</button>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input type="date" id="customExpiryDate" style={{ colorScheme: 'dark' }} className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-blue-500" />
                      <button onClick={() => {
                        const val = document.getElementById('customExpiryDate').value;
                        if (val) handleSetCustomExpiry(selectedProfile._id, val);
                      }} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">Set Date</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#242424] rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Compensation Details</p>
                    <p className="text-2xl font-bold text-green-500">${selectedProfile.salary} <span className="text-sm text-gray-500 font-normal">/ month</span></p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Attendance History (Last 5)</p>
                  <div className="space-y-2">
                    {selectedProfile.attendanceLog && selectedProfile.attendanceLog.slice(-5).reverse().map((date, i) => (
                      <div key={i} className="text-sm bg-[#242424] px-3 py-2 rounded-lg">
                        {new Date(date).toLocaleString()}
                      </div>
                    ))}
                    {(!selectedProfile.attendanceLog || selectedProfile.attendanceLog.length === 0) && (
                      <p className="text-sm text-gray-500">No attendance records.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#1a1a1a] rounded-2xl border border-gray-800 w-full max-w-md overflow-hidden shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Member</h2>
                <button onClick={() => setShowAddMember(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddNewMember} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input type="text" required className="w-full bg-[#242424] border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email ID</label>
                  <input type="email" required className="w-full bg-[#242424] border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                  <input type="tel" required className="w-full bg-[#242424] border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500" placeholder="e.g. 555-0101" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subscription Expiry Date</label>
                  <input type="date" required style={{ colorScheme: 'dark' }} className="w-full bg-[#242424] border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 text-gray-300" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">FaceNet Picture (Optional)</label>
                  <input type="file" accept="image/*" className="w-full bg-[#242424] border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 mt-4">
                  Save Member
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
