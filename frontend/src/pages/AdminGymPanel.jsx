import React from 'react';
import { Users, Shield, TrendingUp } from 'lucide-react';

export default function AdminGymPanel() {
  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gym Admin Panel</h1>
        <p className="text-gray-400 mt-1">Manage your FitFix HQ members</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 border-l-4 border-l-green-500">
          <p className="text-gray-400 text-sm">Subscription Status</p>
          <p className="text-2xl font-bold text-green-500 uppercase mt-1">Active</p>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Members</p>
              <p className="text-3xl font-bold mt-1">142</p>
            </div>
            <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><Users size={20} /></div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Active Today</p>
              <p className="text-3xl font-bold mt-1">38</p>
            </div>
            <div className="p-2 bg-accent/20 text-accent rounded-lg"><TrendingUp size={20} /></div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Member Directory</h2>
          <button className="px-4 py-2 bg-[#242424] text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
            + Add Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#242424] text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Workout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                { name: 'Demo User', email: 'user@fitfix.com', status: 'Active', last: '2 hrs ago' },
                { name: 'Sarah Connor', email: 'sarah@example.com', status: 'Active', last: '1 day ago' },
                { name: 'John Doe', email: 'john@example.com', status: 'Inactive', last: '2 weeks ago' },
              ].map((member, i) => (
                <tr key={i} className="hover:bg-[#242424]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{member.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
