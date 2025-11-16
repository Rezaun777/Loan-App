export const LOAN_DURATIONS = [12, 24, 36, 48, 60]
export const LOAN_AMOUNTS = [
  50000, 100000, 150000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1200000, 1500000,
  1800000, 2000000,
]

// Updated to match the specified calculation
export function calculateMonthlyInstallment(amount: number, months: number): number {
  const monthlyInterestRate = 0.002 // 0.20% monthly interest rate
  const totalInterest = amount * monthlyInterestRate * months
  const totalAmount = amount + totalInterest
  return totalAmount / months
}

// Add function to calculate all loan details
export function calculateLoanDetails(amount: number, months: number): {
  principal: number
  monthlyInterestRate: number
  monthlyInterest: number
  totalInterest: number
  totalAmount: number
  monthlyInstallment: number
} {
  const monthlyInterestRate = 0.002 // 0.20% monthly interest rate
  const monthlyInterest = amount * monthlyInterestRate
  const totalInterest = monthlyInterest * months
  const totalAmount = amount + totalInterest
  const monthlyInstallment = totalAmount / months
  
  return {
    principal: amount,
    monthlyInterestRate,
    monthlyInterest,
    totalInterest,
    totalAmount,
    monthlyInstallment
  }
}

export interface LoanOption {
  duration: number
  amount: number
  monthlyInstallment: number
  // Add additional details for display
  principal: number
  monthlyInterest: number
  totalInterest: number
  totalAmount: number
}

export function getLoanOptions(): LoanOption[] {
  const options: LoanOption[] = []
  for (const amount of LOAN_AMOUNTS) {
    for (const duration of LOAN_DURATIONS) {
      const details = calculateLoanDetails(amount, duration)
      options.push({
        duration,
        amount,
        monthlyInstallment: details.monthlyInstallment,
        principal: details.principal,
        monthlyInterest: details.monthlyInterest,
        totalInterest: details.totalInterest,
        totalAmount: details.totalAmount
      })
    }
  }
  return options
}