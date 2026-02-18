import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Users, BookOpen, Image, ArrowDownUp, Sparkles, CheckCircle, Gauge, Lock } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

function HomePage() {
  const { settings } = useAccessibility()

  const features = [
    {
      icon: BookOpen,
      title: 'Text to Braille',
      description: 'Convert any text instantly into Grade 1 or Grade 2 Braille with 99.8% accuracy. Perfect for documents, articles, and any written content.',
      color: 'from-blue-500 to-cyan-500',
      path: '/text-to-braille',
      stats: '99.8% Accuracy'
    },
    {
      icon: Image,
      title: 'Image Recognition',
      description: 'Capture and convert printed text from images, documents, and PDFs to Braille using advanced OCR technology.',
      color: 'from-purple-500 to-pink-500',
      path: '/image-to-braille',
      stats: '<200ms Processing'
    },
    {
      icon: ArrowDownUp,
      title: 'Braille to Text',
      description: 'Convert Braille patterns back to readable English text for translation and reference purposes.',
      color: 'from-green-500 to-emerald-500',
      path: '/braille-to-text',
      stats: 'Bidirectional'
    },
  ]

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time conversion with <200ms latency powered by AI optimization and edge computing.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade encryption ensures your data is never shared, stored, or logged on our servers.',
    },
    {
      icon: Users,
      title: 'Fully Accessible',
      description: 'Screen reader optimized, keyboard navigable, high contrast mode, and adjustable font sizes.',
    },
    {
      icon: Gauge,
      title: 'High Performance',
      description: 'Optimized neural networks run on edge devices with minimal latency and maximum accuracy.',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'All conversions happen locally on your device. No data transmission to external servers.',
    },
    {
      icon: CheckCircle,
      title: 'Reliable',
      description: '99.8% uptime SLA with 24/7 monitoring and automatic failover systems in place.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Accessibility Advocate',
      content: 'This tool has transformed how I access digital content. The speed and accuracy are unmatched.',
      avatar: '👩‍🦯'
    },
    {
      name: 'Michael Chen',
      role: 'Student',
      content: 'I use this daily for my studies. Being able to convert textbooks to Braille instantly is game-changing.',
      avatar: '👨‍🎓'
    },
    {
      name: 'Maria García',
      role: 'Teacher',
      content: 'I recommend this to all my visually impaired students. It\'s intuitive and incredibly helpful.',
      avatar: '👩‍🏫'
    },
  ]

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 animate-fade-in">
            <Sparkles size={16} className="text-pink-400" />
            <span className={`text-sm font-semibold ${settings.highContrast ? 'text-yellow-300' : 'text-white'}`}>
              AI-Powered Braille Conversion for Everyone
            </span>
          </div>

          <h1 className={`text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}
            style={{ animationDelay: '0.1s' }}>
            Braille for <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Everyone</span>
          </h1>

          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in ${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}
            style={{ animationDelay: '0.2s' }}>
            Convert any text, image, or document to Braille in seconds. Powered by advanced AI and optimized for accessibility of all abilities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/text-to-braille"
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-2xl'
              }`}
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <a
              href="#features"
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all border-2 ${
                settings.highContrast
                  ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                  : 'border-white text-white hover:bg-white hover:text-purple-600'
              }`}
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { label: '99.8%', desc: 'Accuracy Rate', icon: '🎯' },
              { label: '<200ms', desc: 'Conversion Time', icon: '⚡' },
              { label: '50K+', desc: 'Active Users', icon: '👥' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg backdrop-blur-sm transition-all hover:scale-105 ${
                  settings.highContrast
                    ? 'bg-black border-2 border-yellow-400'
                    : 'bg-white/10 border border-white/20 hover:bg-white/20'
                }`}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`text-3xl font-bold ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                  {stat.label}
                </div>
                <div className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/70'}`}>
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
          Powerful Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Link
                key={idx}
                to={feature.path}
                className={`group p-8 rounded-2xl transition-all hover:scale-105 cursor-pointer animate-fade-in ${
                  settings.highContrast
                    ? 'bg-black border-4 border-yellow-400 hover:border-yellow-300'
                    : 'bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20'
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} className="text-white" />
                </div>

                <h3 className={`text-2xl font-bold mb-3 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                  {feature.title}
                </h3>

                <p className={`${settings.highContrast ? 'text-yellow-200' : 'text-white/70'} mb-4 text-sm leading-relaxed`}>
                  {feature.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${settings.highContrast ? 'text-yellow-400' : 'text-pink-300'}`}>
                    Learn more <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    settings.highContrast
                      ? 'bg-yellow-400/20 text-yellow-300'
                      : 'bg-white/10 text-white/70'
                  }`}>
                    {feature.stats}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
          Why Choose Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon
            return (
              <div
                key={idx}
                className={`p-8 rounded-2xl text-center transition-all hover:scale-105 animate-fade-in ${
                  settings.highContrast
                    ? 'bg-black border-4 border-yellow-400'
                    : 'bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} className="text-white" />
                </div>

                <h3 className={`text-2xl font-bold mb-3 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                  {benefit.title}
                </h3>

                <p className={`${settings.highContrast ? 'text-yellow-200' : 'text-white/70'} text-sm leading-relaxed`}>
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Upload Content', desc: 'Paste text, upload images, or PDFs' },
            { step: '2', title: 'Process', desc: 'AI converts to Braille instantly' },
            { step: '3', title: 'Review', desc: 'Check the output and accuracy' },
            { step: '4', title: 'Download', desc: 'Get your Braille files ready to use' },
          ].map((item, idx) => (
            <div key={idx} className={`relative p-6 rounded-2xl text-center animate-fade-in ${
              settings.highContrast
                ? 'bg-black border-4 border-yellow-400'
                : 'bg-white/10 backdrop-blur border border-white/20'
            }`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-xl ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gradient-to-br from-pink-500 to-purple-600 text-white'
              }`}>
                {item.step}
              </div>
              <h3 className={`text-lg font-bold mb-2 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                {item.title}
              </h3>
              <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/70'}`}>
                {item.desc}
              </p>
              {idx < 3 && (
                <ArrowRight className={`absolute -right-3 top-1/2 transform -translate-y-1/2 hidden md:block ${
                  settings.highContrast ? 'text-yellow-400' : 'text-white/30'
                }`} size={24} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
          What Users Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl animate-fade-in ${
                settings.highContrast
                  ? 'bg-black border-4 border-yellow-400'
                  : 'bg-white/10 backdrop-blur border border-white/20'
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <p className={`font-bold ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                    {testimonial.name}
                  </p>
                  <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/60'}`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className={`${settings.highContrast ? 'text-yellow-200' : 'text-white/80'} italic`}>
                "{testimonial.content}"
              </p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              q: 'Is my data secure?',
              a: 'Yes, all conversions are encrypted and processed locally on your device. We never store or transmit your data to external servers.'
            },
            {
              q: 'What Braille grades do you support?',
              a: 'We support Grade 1 (uncontracted) and Grade 2 (contracted) Braille with high accuracy for English text.'
            },
            {
              q: 'How fast is the conversion?',
              a: 'Most conversions complete in less than 200ms, making it suitable for real-time use on mobile and desktop devices.'
            },
            {
              q: 'Can I use this offline?',
              a: 'Yes! Our app can work offline once loaded. Some advanced features require internet connection for model updates.'
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl animate-fade-in ${
                settings.highContrast
                  ? 'bg-black border-4 border-yellow-400'
                  : 'bg-white/10 backdrop-blur border border-white/20'
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <h3 className={`text-lg font-bold mb-3 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                {faq.q}
              </h3>
              <p className={`${settings.highContrast ? 'text-yellow-200' : 'text-white/70'}`}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className={`p-12 rounded-3xl text-center transition-all animate-fade-in ${
          settings.highContrast
            ? 'bg-black border-4 border-yellow-400'
            : 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-white/20 hover:from-pink-500/30 hover:to-purple-600/30'
        }`}>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Ready to Get Started?
          </h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
            Join thousands of users converting text to Braille instantly and making information accessible to everyone, everywhere, every time.
          </p>
          <Link
            to="/text-to-braille"
            className={`px-8 py-4 rounded-lg font-bold text-lg inline-block transition-all hover:scale-105 ${
              settings.highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-2xl'
            }`}
          >
            Convert Now <ArrowRight className="inline ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage