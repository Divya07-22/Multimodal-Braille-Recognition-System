// import React, { useState } from 'react'
// import { Link } from 'react-router-dom'
// import useAuthStore from '../hooks/useAuth'

// const ResendVerification = () => {
//   const { resendVerification, isLoading } = useAuthStore()
//   const [email, setEmail] = useState('')
//   const [message, setMessage] = useState('')
//   const [error, setError] = useState('')

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setMessage('')
//     setError('')
//     try {
//       const msg = await resendVerification(email)
//       setMessage(msg)
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
//             <p className="text-gray-400">Resend verification email</p>
//           </div>

//           {message && (
//             <div className="bg-green-900/30 border border-green-500/50 text-green-400 rounded-xl p-4 mb-6 text-sm">
//               {message}
//             </div>
//           )}

//           {error && (
//             <div className="bg-red-900/30 border border-red-500/50 text-red-400 rounded-xl p-4 mb-6 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
//               <input
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Sending...' : 'Resend Verification Email'}
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

// export default ResendVerification