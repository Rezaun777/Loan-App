"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function HelpPage() {
  const contactInfo = [
    {
      id: 1,
      name: "whatsapp",
      title: "WhatsApp",
      description: "WhatsApp - এ যোগাযোগ করুন",
      contact: "+8801761110219",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.480-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: "bg-green-500"
    },
    {
      id: 2,
      name: "imo",
      title: "Imo",
      description: "Imo - তে যোগাযোগ করুন",
      contact: "+8801761110219",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 4.975-12 11.111 0 3.493 1.747 6.616 4.472 8.652v4.237l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111 0-6.136-5.373-11.111-12-11.111zm.029 18.662l-2.571-1.429-2.534 1.429.534-2.426-1.833-1.669 2.548-.221 1.029-2.232 1.029 2.232 2.548.221-1.833 1.669.534 2.426zm-5.88-7.108c-.608-.699-.608-1.833 0-2.532.608-.699 1.594-.699 2.202 0 .608.699.608 1.833 0 2.532-.608.699-1.594.699-2.202 0zm4.272 0c-.608-.699-.608-1.833 0-2.532.608-.699 1.594-.699 2.202 0 .608.699.608 1.833 0 2.532-.608.699-1.594.699-2.202 0z"/>
        </svg>
      ),
      color: "bg-blue-500"
    },
    {
      id: 3,
      name: "telegram",
      title: "Telegram",
      description: "Telegram - তে যোগাযোগ করুন",
      contact: "+8801761110219",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.14.141-.259.259-.374.261l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.136-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      ),
      color: "bg-sky-500"
    },
    {
      id: 4,
      name: "email",
      title: "Email",
      description: "ইমেইল - এ যোগাযোগ করুন",
      contact: "helplineservice24to7@gmail.com",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-red-500"
    }
  ];

  return (
    <div className="w-full space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary mb-2">সাহায্য</h1>
      
      {/* First Section: How we can help - HIDDEN as per user request */}
      {/* 
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">আমরা কিভাবে আপনাকে সাহায্য করতে পারি?</h2>
        <p className="text-center text-blue-800 mb-8 text-lg">
          নিচে দেওয়া যেকোনো মাধ্যমে আপনি আমাদের সাথে যোগাযোগ করতে পারেন
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactInfo.map((contact) => (
            <Card key={contact.id} className="p-5 bg-white border border-blue-100 shadow-md rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col md:flex-row items-start">
                <div className={`p-3 rounded-full ${contact.color} text-white mb-3 md:mb-0 md:mr-4 flex-shrink-0 self-center md:self-start`}>
                  {contact.icon}
                </div>
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{contact.title}</h3>
                  <p className="text-gray-700 text-sm mb-3">{contact.description}</p>
                  <div className="bg-gray-100 p-3 rounded-lg break-words">
                    <p className="text-gray-900 text-sm font-medium">{contact.contact}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
      */}

      {/* Second Section: Address and Service Hours */}
      <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-amber-900">ঠিকানা ও সার্ভিস সময়</h2>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-md">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-amber-800 mb-3">ঠিকানা</h3>
              <p className="text-gray-800 text-lg">
                ই-৩২, আগারগাঁও, শেরে-বাংলা নগর, ঢাকা - ১২০৭
              </p>
            </div>
            
            <div className="border-t border-amber-100 pt-6">
              <h3 className="text-xl font-semibold text-amber-800 mb-3">সার্ভিস</h3>
              <p className="text-gray-800 text-lg">
                সকাল ৯টা থেকে রাত ৮টা, শনিবার থেকে বৃহস্পতিবার
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}