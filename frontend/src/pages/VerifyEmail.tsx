// import React, { useEffect, useState } from 'react'
// import { useSearchParams, Link } from 'react-router-dom'
// import useAuthStore from '../hooks/useAuth'

// const VerifyEmail = () => {
//   const [searchParams] = useSearchParams()
//   const { verifyEmail, isLoading } = useAuthStore()
//   const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
//   const [message, setMessage] = useState('')

//   useEffect(() => {
//     const token = searchParams.get('token')
//     if (!token) {
//       setStatus('error')
//       setMessage('No verification token found in the URL.')
//       return
//     }
//     verifyEmail(token)
//       .then((msg) => {
//         setMessage(msg)
//         setStatus('success')
//       })
//       .catch((err) => {
//         setMessage(err.message)
//         setStatus('error')
//       })
//   }, [])

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="w-full max-w-md">
//         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
//           <h1 className="text-3xl font-black text-white mb-6">⚡ BrailleAI</h1>

//           {status === 'loading' && (
//             <div>
//               <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//               <p className="text-gray-400">Verifying your email...</p>
//             </div>
//           )}

//           {status === 'success' && (
//             <div>
//               <div className="text-5xl mb-4">✅</div>
//               <h2 className="text-xl font-bold text-green-400 mb-3">Email Verified!</h2>
//               <p className="text-gray-400 mb-6">{message}</p>
//               <Link
//                 to="/login"
//                 className="inline-block py-3 px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition"
//               >
//                 Go to Login
//               </Link>
//             </div>
//           )}

//           {status === 'error' && (
//             <div>
//               <div className="text-5xl mb-4">❌</div>
//               <h2 className="text-xl font-bold text-red-400 mb-3">Verification Failed</h2>
//               <p className="text-gray-400 mb-6">{message}</p>
//               <Link
//                 to="/resend-verification"
//                 className="inline-block py-3 px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition"
//               >
//                 Resend Verification Email
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default VerifyEmail