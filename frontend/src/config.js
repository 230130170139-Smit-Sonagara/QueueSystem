const required = (key) => {
    const val = import.meta.env[key]
    if (!val) throw new Error(`Missing required env variable: ${key}`)
    return val
}

export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
    // add more as needed: required('VITE_SOME_KEY')
}