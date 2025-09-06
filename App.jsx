import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

// Firebase config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDl3G5ODo8--J8iw2HTZ7YrnxPk4gnj7zA",
  authDomain: "jdhdhhd-3eb7f.firebaseapp.com",
  projectId: "jdhdhhd-3eb7f",
  storageBucket: "jdhdhhd-3eb7f.firebasestorage.app",
  messagingSenderId: "613046695940",
  appId: "1:613046695940:web:066bd23677d17ed23ddd51",
  measurementId: "G-7K968Q59M5"
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    iban: "",
    amount: "",
    monthly: "",
    duration: "",
    type: "شخصي",
    fees: "",
  });
  const [requests, setRequests] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminMode) {
      fetchRequests();
    }
  }, [adminMode]);

  const fetchRequests = async () => {
    const querySnapshot = await getDocs(collection(db, "requests"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRequests(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateRequestId = () => {
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BNK-${yyyymmdd}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestId = generateRequestId();
      await addDoc(collection(db, "requests"), {
        ...formData,
        status: "معلق",
        requestId,
        createdAt: new Date(),
      });
      alert(`تم إرسال الطلب بنجاح. رقم الطلب: ${requestId}`);
      setFormData({
        name: "",
        nationalId: "",
        iban: "",
        amount: "",
        monthly: "",
        duration: "",
        type: "شخصي",
        fees: "",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "requests", id), { status });
    fetchRequests();
  };

  const updateFees = async (id, fees) => {
    await updateDoc(doc(db, "requests", id), { fees });
    fetchRequests();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🚀 نظام رفع طلبات التمويل</h1>
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded-xl"
          onClick={() => setAdminMode(!adminMode)}
        >
          {adminMode ? "👤 وضع المستخدم" : "🛠️ لوحة الإدارة"}
        </button>
      </div>

      {!adminMode ? (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow"
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="الاسم الكامل"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            placeholder="رقم الهوية"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="iban"
            value={formData.iban}
            onChange={handleChange}
            placeholder="رقم الايبان"
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="قيمة التمويل"
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="monthly"
            value={formData.monthly}
            onChange={handleChange}
            placeholder="القسط الشهري"
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="مدة السداد (بالأشهر)"
            className="p-2 border rounded"
            required
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="شخصي">شخصي</option>
            <option value="مؤسسات">مؤسسات</option>
          </select>
          <input
            type="number"
            name="fees"
            value={formData.fees}
            onChange={handleChange}
            placeholder="الرسوم (اختياري)"
            className="p-2 border rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="col-span-2 bg-green-600 text-white py-2 rounded-xl mt-4"
          >
            {loading ? "⏳ جاري الإرسال..." : "إرسال الطلب"}
          </button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">📋 الطلبات</h2>
          {requests.length === 0 ? (
            <p>لا توجد طلبات حالياً.</p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">رقم الطلب</th>
                  <th className="p-2 border">الاسم</th>
                  <th className="p-2 border">المبلغ</th>
                  <th className="p-2 border">الحالة</th>
                  <th className="p-2 border">رسوم</th>
                  <th className="p-2 border">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="text-center">
                    <td className="border p-2">{req.requestId}</td>
                    <td className="border p-2">{req.name}</td>
                    <td className="border p-2">{req.amount}</td>
                    <td className="border p-2">{req.status}</td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={req.fees || ""}
                        onChange={(e) => updateFees(req.id, e.target.value)}
                        className="p-1 border rounded w-20 text-center"
                      />
                    </td>
                    <td className="border p-2 flex gap-2 justify-center">
                      <button
                        onClick={() => updateStatus(req.id, "مقبول")}
                        className="px-2 py-1 bg-green-500 text-white rounded"
                      >
                        ✔️ قبول
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, "مرفوض")}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        ❌ رفض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
