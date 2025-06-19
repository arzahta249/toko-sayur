'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Image from "next/image";

interface MessageDetail {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  reply?: string;
  createdAt?: string;
}

export default function ContactPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  const [messages, setMessages] = useState<MessageDetail[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MessageDetail | null>(null);
  const [reply, setReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [adminReply, setAdminReply] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<MessageDetail | null>(null);

  // Ambil email dari localStorage saat load pertama
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setSubmittedEmail(savedEmail);
      fetchLatestMessage(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/contact')
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(() => toast.error('Gagal memuat pesan'));
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setReply('');
      return;
    }
    fetch(`/api/contact/${selectedId}`)
      .then((res) => res.json())
      .then((data) => {
        setDetail(data);
        setReply(data.reply || '');
      })
      .catch(() => toast.error('Gagal memuat detail pesan'));
  }, [selectedId]);

  const fetchLatestMessage = (email: string) => {
    fetch(`/api/contact?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data: MessageDetail[]) => {
        if (!Array.isArray(data) || data.length === 0) {
          setLastMessage(null);
          setAdminReply(null);
          return;
        }
        const latest = data.sort(
          (a, b) =>
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        )[0];
        setLastMessage(latest);
        setAdminReply(latest.reply || null);
      })
      .catch(() => {
        toast.error('Gagal memuat balasan');
        setLastMessage(null);
        setAdminReply(null);
      });
  };

  useEffect(() => {
    if (submittedEmail) {
      fetchLatestMessage(submittedEmail);
    }
  }, [submittedEmail]);

  const handleReply = async () => {
    if (!selectedId || !reply.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/contact/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) throw new Error('Gagal membalas pesan');
      toast.success('Balasan terkirim');
      setDetail((prev) => (prev ? { ...prev, reply } : null));
      setMessages((msgs) =>
        msgs.map((m) => (m.id === selectedId ? { ...m, reply } : m))
      );
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsReplying(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Gagal mengirim pesan');

      toast.success('Pesan berhasil dikirim');
      setSubmittedEmail(form.email);
      localStorage.setItem('userEmail', form.email); // Simpan email ke localStorage
      setForm({ name: '', email: '', subject: '', message: '' });

      fetchLatestMessage(form.email);
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Yakin ingin menghapus pesan ini?");
    if (!confirmed) return;
  
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });
  
      if (!res.ok) throw new Error("Gagal menghapus");
  
      // Perbarui daftar pesan
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
  
      // Jika pesan yang sedang dibuka dihapus
      if (selectedId === id) {
        setSelectedId(null);
        setDetail(null);
      }
  
      toast.success("Pesan berhasil dihapus!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus pesan.");
    }
  };
  

  if (isAdmin) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 px-4">
        <h1 className="text-4xl font-bold text-center mb-10">Admin: Kelola Pesan Kontak</h1>
        <div className="max-w-6xl mx-auto flex gap-6">
          <div className="w-1/3 border rounded-md shadow p-4 max-h-[600px] overflow-auto bg-white">
            <h2 className="font-semibold mb-4">Daftar Pesan Masuk</h2>
            <ul>
  {messages.map((msg) => (
    <li
      key={msg.id}
      className={`relative p-3 cursor-pointer border-b hover:bg-gray-100 ${
        selectedId === msg.id ? "bg-green-100" : ""
      }`}
    >
      <div onClick={() => setSelectedId(msg.id)}>
        <p className="font-semibold">{msg.name}</p>
        <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
        <p className="text-xs mt-1">
          {msg.reply ? "✅ Sudah dibalas" : "❌ Belum dibalas"}
        </p>
      </div>

      <button
        onClick={() => handleDelete(msg.id)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        title="Hapus Pesan"
      >
        🗑️
      </button>
    </li>
  ))}
</ul>

          </div>

          <div className="w-2/3 bg-white rounded-md shadow p-6 max-h-[600px] overflow-auto">
            {!detail ? (
              <p className="text-center text-gray-500">Pilih pesan untuk lihat detail</p>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-3">Detail Pesan</h3>
                <p><strong>Nama:</strong> {detail.name}</p>
                <p><strong>Email:</strong> {detail.email}</p>
                <p><strong>Subjek:</strong> {detail.subject}</p>
                <p><strong>Pesan:</strong> {detail.message}</p>
                <p className="text-sm text-gray-500">
                  <strong>Dikirim:</strong>{' '}
                  {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '-'}
                </p>

                <div className="mt-6">
                  <label htmlFor="reply" className="block font-semibold mb-2">Balasan:</label>
                  <textarea
                    id="reply"
                    rows={6}
                    className="w-full border rounded p-2"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Tulis balasan Anda di sini..."
                  />
                  <button
                    onClick={handleReply}
                    disabled={!reply.trim() || isReplying}
                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isReplying ? 'Mengirim...' : 'Kirim Balasan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold">#BapakTani</h1>
        <p className="text-gray-600 mt-2">&quot;Butuh bantuan? Kirim pesan ke kami!&quot;</p>
      </section>

      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mb-10 px-4">
        <div>
          <span className="text-sm text-green-600 font-medium uppercase">Hubungi Kami</span>
          <h2 className="text-2xl font-semibold mt-2 mb-4">Kunjungi atau hubungi kami</h2>
          <ul className="space-y-3 text-gray-700">
            <li><strong>📍 Alamat:</strong> Jl. Moga-Guci, Kec. Pulosari, Pemalang</li>
            <li><strong>✉️ Email:</strong> Marzaalifi@gmail.com</li>
            <li><strong>📞 Telepon:</strong> +62 823 1416 9288</li>
            <li><strong>⏰ Jam Buka:</strong> 09.00 - 20.00, Sabtu - Kamis</li>
          </ul>
        </div>
        <div>
          <Image
            src="/logotokoAI.jpg"
            alt="Lokasi"
            className="rounded-md object-cover w-full h-[300px]"
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        <section className="flex-[2] bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">Tinggalkan Pesan</h2>
          <form onSubmit={handleSubmit} className="space-y-5 text-lg">
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Nama" className="w-full border rounded px-4 py-2" />
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="w-full border rounded px-4 py-2" />
            <input name="subject" value={form.subject} onChange={handleChange} required placeholder="Subjek" className="w-full border rounded px-4 py-2" />
            <textarea name="message" rows={5} value={form.message} onChange={handleChange} required placeholder="Pesan" className="w-full border rounded px-4 py-2" />
            <button type="submit" className="bg-green-600 text-white text-lg rounded px-5 py-2 hover:bg-green-700">
              Kirim Pesan
            </button>
          </form>
        </section>

        <section className="flex-1 bg-white p-6 rounded-lg shadow-md text-sm">
          <h2 className="text-base font-semibold mb-4 text-center">Profil Tim</h2>
          <div className="border border-gray-300 rounded-lg p-4 shadow-sm bg-gray-50">
            <div className="flex items-center gap-4">
              <Image src="/logotokoAI.jpg" alt="Developer" className="w-20 h-20 object-cover rounded-full" />
              <div>
                <p><strong>Nama:</strong> M Alifi Arzahta</p>
                <p><strong>Kontak:</strong> 082314169288</p>
                <p><strong>Email:</strong> marzaalifi@gmail.com</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="max-w-4xl mx-auto bg-white mt-12 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-green-700 mb-4">💬 Percakapan Terakhir</h2>

        {submittedEmail ? (
          <>
            {lastMessage ? (
              <div className="flex items-start space-x-4 mb-6 bg-gray-50 border border-gray-200 p-4 rounded-md">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold">
                  U
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {new Date(lastMessage.createdAt || '').toLocaleString()}
                  </p>
                  <p className="text-gray-800">{lastMessage.message}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Belum ada pesan ditemukan.</p>
            )}

            {adminReply ? (
              <div className="flex items-start space-x-4 bg-green-50 border border-green-200 p-4 rounded-md">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                  A
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admin membalas:</p>
                  <p className="text-gray-800">{adminReply}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Belum ada balasan dari admin.</p>
            )}

            {/* Tombol untuk menghapus riwayat */}
            <button
              onClick={() => {
                localStorage.removeItem('userEmail');
                setSubmittedEmail('');
                setLastMessage(null);
                setAdminReply(null);
              }}
              className="mt-4 text-sm text-red-500 hover:underline"
            >
              Hapus riwayat percakapan (logout)
            </button>
          </>
        ) : (
          <p className="text-gray-500 italic">Silakan kirim pesan terlebih dahulu untuk melihat percakapan.</p>
        )}
      </section>
    </div>
  );
}
