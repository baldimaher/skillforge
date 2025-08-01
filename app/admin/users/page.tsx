"use client";

import { CheckCircle, Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";

import axios from "axios";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function AdminUserApprovalPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("/api/admin/users/not-approved");
      setUsers(res.data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const approveUser = async (id: string) => {
    setApprovingId(id);
    await axios.put(`/api/admin/users/${id}/approve`);
    setUsers(users.filter((user) => user._id !== id));
    setApprovingId(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Utilisateurs à approuver</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-center mt-12">🎉 Tous les utilisateurs ont été approuvés.</p>
      ) : (
        <div className="grid gap-5">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-md rounded-xl p-5 flex justify-between items-center hover:shadow-lg transition duration-300"
            >
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
                onClick={() => approveUser(user._id)}
                disabled={approvingId === user._id}
              >
                {approvingId === user._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {approvingId === user._id ? "Approbation..." : "Approuver"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
