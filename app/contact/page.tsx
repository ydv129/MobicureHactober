"use client"

import type React from "react"

import { Mail, Send, User, MessageSquare, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const mailto = new URL(`mailto:YDV129111@GMAIL.COM`)
    const subject = formData.subject || "New message from MOBICURE contact"

    const bodyLines = [
      `Name: ${formData.name || ""}`,
      `Email: ${formData.email || ""}`,
      "",
      "Message:",
      formData.message || "",
    ]

    mailto.searchParams.set("subject", subject)
    mailto.searchParams.set("body", bodyLines.join("\n"))

    window.location.href = mailto.toString()

    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Shield className="h-20 w-20 text-cyan-400 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Zap className="h-8 w-8 text-green-400 animate-bounce" />
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-4 animate-pulse">
            Contact Developer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Get in touch with the MOBICURE development team for support, feedback, or collaboration opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300">
              <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center">
                <User className="h-8 w-8 mr-3 animate-pulse" />
                Developer Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-black/30 rounded-lg hover:bg-cyan-400/10 transition-colors duration-300 cursor-crosshair">
                  <Mail className="h-6 w-6 text-cyan-400 animate-bounce" />
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Email</h3>
                    <p className="text-gray-300">YDV129111@GMAIL.COM</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-black/30 rounded-lg hover:bg-cyan-400/10 transition-colors duration-300 cursor-crosshair">
                  <User className="h-6 w-6 text-green-400 animate-pulse" />
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Developer</h3>
                    <p className="text-gray-300">NEERAJ YADAV</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-black/30 rounded-lg hover:bg-cyan-400/10 transition-colors duration-300 cursor-crosshair">
                  <Shield className="h-6 w-6 text-purple-400 animate-spin" />
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Specialization</h3>
                    <p className="text-gray-300">Cybersecurity & Privacy Solutions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Response Time</h3>
              <p className="text-gray-300 leading-relaxed">
                We typically respond to inquiries within 24-48 hours. For urgent security matters, please mark your
                message as "URGENT" in the subject line.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center">
              <MessageSquare className="h-8 w-8 mr-3 animate-pulse" />
              Send Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-black/50 border-cyan-500/30 text-white focus:border-cyan-400 transition-colors duration-300"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-cyan-400 font-semibold mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-black/50 border-cyan-500/30 text-white focus:border-cyan-400 transition-colors duration-300"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-cyan-400 font-semibold mb-2">Subject</label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="bg-black/50 border-cyan-500/30 text-white focus:border-cyan-400 transition-colors duration-300"
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div>
                <label className="block text-cyan-400 font-semibold mb-2">Message</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-black/50 border-cyan-500/30 text-white focus:border-cyan-400 transition-colors duration-300 min-h-32"
                  placeholder="Detailed message about your inquiry, feedback, or collaboration proposal..."
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-black font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 cursor-crosshair"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
