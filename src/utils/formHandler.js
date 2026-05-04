/**
 * Simulates a form submission (replace with your real API/EmailJS/etc.)
 * Returns a Promise that resolves on success or rejects on failure.
 */
export async function submitEnquiry(formData) {
  // TODO: Replace this with your real API call, e.g.:
  // return fetch('https://your-api.com/enquiry', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(formData),
  // })

  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Enquiry submitted:', formData)
      resolve({ success: true })
    }, 1200)
  })
}

/**
 * Basic client-side validation for the contact form.
 * Returns an object of field errors, or empty object if valid.
 */
export function validateEnquiry({ name, email, message }) {
  const errors = {}
  if (!name?.trim()) errors.name = 'Name is required.'
  if (!email?.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address.'
  if (!message?.trim()) errors.message = 'Please describe your requirements.'
  return errors
}
