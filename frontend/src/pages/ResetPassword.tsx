// import React, { useState } from 'react'
// import { useSearchParams, Link, useNavigate } from 'react-router-dom'
// import useAuthStore from '../hooks/useAuth'

// const ResetPassword = () => {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const { resetPassword, isLoading } = useAuthStore()
//   const [newPassword, setNewPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [message, setMessage] = useState('')
//   const [error, setError] = useState('')

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setMessage('')
//     setError('')

//     const token = searchParams.get('token')
//     if (!token) {
//       setError('No reset token found in the URL.')
//       return
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match.')
//       return
//     }

//     try {
//       const msg = await resetPassword(token, newPassword)
//       setMessage(msg)
//       setTimeout(() => navigate('/login'), 2500)
//     } catch (err: any) {
//       setError(err.message)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="w-full max-w-md">
//         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-black text-white mb-2">⚡ BrailleAI</h1>
//             <p className="text-gray-400">Set new password</p>
//           </div>

//           {message && (
//             <div className="bg-green-900/30 border border-green-500/50 text-green-400 rounded-xl p-4 mb-6 text-sm">
//               {message} Redirecting to login...
//             </div>
//           )}

//           {error && (
//             <div className="bg-red-900/30 border border-red-500/50 text-red-400 rounded-xl p-4 mb-6 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
//               <input
//                 type="password"
//                 required
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition"
//                 placeholder="Min 8 chars, 1 uppercase, 1 number"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
//               <input
//                 type="password"
//                 required
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition"
//                 placeholder="Re-enter new password"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Resetting...' : 'Reset Password'}
//             </button>
//           </form>

//           <p className="text-center text-gray-500 mt-6 text-sm">
//             <Link to="/login" className="text-purple-400 hover:text-purple-300">
//               Back to Login
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ResetPassword