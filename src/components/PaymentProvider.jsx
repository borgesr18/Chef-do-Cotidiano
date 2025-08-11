import { createContext, useContext, useState } from 'react'

const PaymentContext = createContext({})

export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}

export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState({
    stripePublicKey: '',
    mercadoPagoPublicKey: '',
    provider: 'stripe'
  })

  const initializePayment = async (courseId, amount, currency = 'BRL') => {
    setLoading(true)
    try {
      const paymentData = {
        courseId,
        amount,
        currency,
        provider: paymentConfig.provider
      }

      console.log('Payment initialization prepared:', paymentData)
      
      return {
        success: true,
        paymentUrl: `/payment/checkout?course=${courseId}&amount=${amount}`,
        sessionId: `session_${Date.now()}`
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (sessionId) => {
    try {
      console.log('Payment confirmation prepared for session:', sessionId)
      
      return {
        success: true,
        enrollmentId: `enrollment_${Date.now()}`
      }
    } catch (error) {
      console.error('Payment confirmation error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    loading,
    paymentConfig,
    setPaymentConfig,
    initializePayment,
    confirmPayment
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}
