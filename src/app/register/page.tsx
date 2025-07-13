"use client";
import Container from "@/components/Container";
import Section from "@/components/Section";
import InputGroup from "@/components/FormElements/InputGroup";
import CountryCodeSelector from "@/components/CountryCodeSelector";
import { useState, useEffect } from "react";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "1", // Default to US
    phone: "",
    address: {
      country: "",
      state: "",
      city: "",
      address: ""
    },
    age: "",
    gender: "prefer_not_to_say",
    role: "patient",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const [addressData, setAddressData] = useState({
    countries: [],
    states: [],
    cities: [],
    loading: false
  });

  const [phoneValidation, setPhoneValidation] = useState({
    isValid: true,
    message: ""
  });

  const [emailValidation, setEmailValidation] = useState({
    isValid: true,
    message: ""
  });

  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    message: "",
    strength: 0
  });

  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    isValid: true,
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setAddressData(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        const data = await response.json();
        if (data.error === false) {
          setAddressData(prev => ({ 
            ...prev, 
            countries: data.data,
            loading: false 
          }));
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setAddressData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (formData.address.country) {
        setAddressData(prev => ({ ...prev, loading: true }));
        try {
          const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ country: formData.address.country })
          });
          const data = await response.json();
          if (data.error === false) {
            setAddressData(prev => ({ 
              ...prev, 
              states: data.data.states,
              cities: [], // Reset cities when country changes
              loading: false 
            }));
          }
        } catch (error) {
          console.error('Error fetching states:', error);
          setAddressData(prev => ({ ...prev, loading: false }));
        }
      } else {
        setAddressData(prev => ({ ...prev, states: [], cities: [] }));
      }
    };

    fetchStates();
  }, [formData.address.country]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.address.country && formData.address.state) {
        setAddressData(prev => ({ ...prev, loading: true }));
        try {
          const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              country: formData.address.country,
              state: formData.address.state
            })
          });
          const data = await response.json();
          if (data.error === false) {
            setAddressData(prev => ({ 
              ...prev, 
              cities: data.data,
              loading: false 
            }));
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
          setAddressData(prev => ({ ...prev, loading: false }));
        }
      } else {
        setAddressData(prev => ({ ...prev, cities: [] }));
      }
    };

    fetchCities();
  }, [formData.address.country, formData.address.state]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });

    try {
      // Validate all required fields
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.countryCode || !formData.phone || !formData.address.country ||
          !formData.address.state || !formData.address.city || !formData.address.address ||
          !formData.password || !formData.confirmPassword) {
        setSubmitMessage({ type: 'error', message: 'Please fill in all required fields' });
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        setSubmitMessage({ type: 'error', message: 'Passwords do not match' });
        return;
      }

      // Validate email and password validation states
      if (!emailValidation.isValid || !passwordValidation.isValid || !confirmPasswordValidation.isValid) {
        setSubmitMessage({ type: 'error', message: 'Please fix validation errors before submitting' });
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          countryCode: formData.countryCode,
          phone: formData.phone,
          address: formData.address,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          role: formData.role,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({ type: 'success', message: 'Registration successful! Redirecting to login...' });
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          countryCode: "1",
          phone: "",
          address: {
            country: "",
            state: "",
            city: "",
            address: ""
          },
          age: "",
          gender: "prefer_not_to_say",
          role: "patient",
          password: "",
          confirmPassword: "",
          agreeToTerms: false
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setSubmitMessage({ type: 'error', message: data.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitMessage({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Container>
        <div className="flex min-h-screen items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-dark dark:text-white">
                Create Your Account
              </h1>
              <p className="mt-2 text-dark-6 dark:text-dark-4">
                Join thousands of users who trust our platform
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-dark-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="First Name"
                    type="text"
                    placeholder="Enter your first name"
                    name="firstName"
                    value={formData.firstName}
                    handleChange={handleInputChange}
                    required
                  />
                  <InputGroup
                    label="Last Name"
                    type="text"
                    placeholder="Enter your last name"
                    name="lastName"
                    value={formData.lastName}
                    handleChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-body-sm font-medium text-dark dark:text-white">
                    Email Address
                    <span className="ml-1 select-none text-red">*</span>
                  </label>
                  <input
                  type="email"
                  placeholder="Enter your email address"
                  name="email"
                  value={formData.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, email: value }));
                      
                      // Email validation
                      if (value.length > 0) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        const isValid = emailRegex.test(value);
                        setEmailValidation({
                          isValid,
                          message: isValid ? "" : "Please enter a valid email address"
                        });
                      } else {
                        setEmailValidation({
                          isValid: true,
                          message: ""
                        });
                      }
                    }}
                    className={`mt-3 w-full rounded-lg border px-5.5 py-3 text-dark placeholder:text-dark-6 outline-none transition focus:border-primary dark:bg-dark-2 dark:text-white ${
                      emailValidation.isValid 
                        ? "border-stroke dark:border-dark-3" 
                        : "border-red-500 dark:border-red-400"
                    }`}
                  required
                />
                  {!emailValidation.isValid && emailValidation.message && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      {emailValidation.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-body-sm font-medium text-dark dark:text-white">
                    Phone Number
                    <span className="ml-1 select-none text-red">*</span>
                  </label>
                  <div className="mt-3 flex">
                    <CountryCodeSelector
                      value={formData.countryCode}
                      onChange={(value) => {
                        setFormData(prev => ({ ...prev, countryCode: value }));
                        // Re-validate phone number when country changes
                        if (formData.phone.length > 0) {
                          try {
                            const fullNumber = `+${value}${formData.phone}`;
                            const isValid = isValidPhoneNumber(fullNumber);
                            setPhoneValidation({
                              isValid,
                              message: isValid ? "" : `Invalid phone number for selected country`
                            });
                          } catch (error) {
                            setPhoneValidation({
                              isValid: false,
                              message: "Invalid phone number format"
                            });
                          }
                        }
                      }}
                      className="w-32"
                    />
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, phone: value }));
                        
                        // Validate phone number for selected country
                        if (value.length > 0) {
                          try {
                            const fullNumber = `+${formData.countryCode}${value}`;
                            const isValid = isValidPhoneNumber(fullNumber);
                            const phoneNumber = parsePhoneNumber(fullNumber);
                            
                            setPhoneValidation({
                              isValid,
                              message: isValid ? "" : `Invalid phone number for selected country`
                            });
                          } catch (error) {
                            setPhoneValidation({
                              isValid: false,
                              message: "Invalid phone number format"
                            });
                          }
                        } else {
                          setPhoneValidation({
                            isValid: true,
                            message: ""
                          });
                        }
                      }}
                      className={`flex-1 rounded-r-lg border border-l-0 px-5.5 py-3 text-dark placeholder:text-dark-6 outline-none transition focus:border-primary dark:bg-dark-2 dark:text-white ${
                        phoneValidation.isValid 
                          ? "border-stroke dark:border-dark-3" 
                          : "border-red-500 dark:border-red-400"
                      }`}
                      required
                    />
                  </div>
                  {!phoneValidation.isValid && phoneValidation.message && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      {phoneValidation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-body-sm font-medium text-dark dark:text-white">
                      Country
                      <span className="ml-1 select-none text-red">*</span>
                    </label>
                    <select
                      value={formData.address.country}
                      onChange={(e) => {
                        handleAddressChange('country', e.target.value);
                        handleAddressChange('state', ''); // Reset state when country changes
                      }}
                      className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      required
                    >
                      <option value="">Select a country</option>
                      {addressData.countries.map((country: any, index: number) => (
                        <option key={`${country.country}-${index}`} value={country.country}>
                          {country.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-body-sm font-medium text-dark dark:text-white">
                      State/Province
                      <span className="ml-1 select-none text-red">*</span>
                    </label>
                    <select
                      value={formData.address.state}
                      onChange={(e) => {
                        handleAddressChange('state', e.target.value);
                        handleAddressChange('city', ''); // Reset city when state changes
                      }}
                      className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      required
                      disabled={!formData.address.country || addressData.loading}
                    >
                      <option value="">
                        {!formData.address.country 
                          ? "Select a country first" 
                          : addressData.loading 
                            ? "Loading states..." 
                            : "Select a state"
                        }
                      </option>
                      {addressData.states.map((state: any, index: number) => (
                        <option key={`${state.name}-${index}`} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-body-sm font-medium text-dark dark:text-white">
                      City
                      <span className="ml-1 select-none text-red">*</span>
                    </label>
                    <select
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      required
                      disabled={!formData.address.state || addressData.loading}
                    >
                      <option value="">
                        {!formData.address.state 
                          ? "Select a state first" 
                          : addressData.loading 
                            ? "Loading cities..." 
                            : "Select a city"
                        }
                      </option>
                      {addressData.cities.map((city: string, index: number) => (
                        <option key={`${city}-${index}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-body-sm font-medium text-dark dark:text-white">
                      Address
                      <span className="ml-1 select-none text-red">*</span>
                    </label>
                    <textarea
                      placeholder="Enter your full address"
                      value={formData.address.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark placeholder:text-dark-6 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white resize-none"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-body-sm font-medium text-dark dark:text-white">
                      Age
                    </label>
                    <input
                      type="number"
                      placeholder="Enter your age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="1"
                      max="120"
                      className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark placeholder:text-dark-6 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-body-sm font-medium text-dark dark:text-white">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    >
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-body-sm font-medium text-dark dark:text-white">
                    Registering as
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-3 w-full rounded-lg border border-stroke px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>

                <div>
                  <label className="text-body-sm font-medium text-dark dark:text-white">
                    Password
                    <span className="ml-1 select-none text-red">*</span>
                  </label>
                  <input
                  type="password"
                  placeholder="Create a strong password"
                  name="password"
                  value={formData.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, password: value }));
                      
                      // Password validation
                      if (value.length > 0) {
                        const hasMinLength = value.length >= 8;
                        const hasUpperCase = /[A-Z]/.test(value);
                        const hasLowerCase = /[a-z]/.test(value);
                        const hasNumber = /\d/.test(value);
                        
                        // Calculate strength
                        let strength = 0;
                        if (hasMinLength) strength += 1;
                        if (hasUpperCase) strength += 1;
                        if (hasLowerCase) strength += 1;
                        if (hasNumber) strength += 1;
                        if (value.length >= 12) strength += 1; // Bonus for longer password
                        
                        const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
                        
                        let message = "";
                        if (!hasMinLength) message = "Password must be at least 8 characters";
                        else if (!hasUpperCase) message = "Password must contain at least one uppercase letter";
                        else if (!hasLowerCase) message = "Password must contain at least one lowercase letter";
                        else if (!hasNumber) message = "Password must contain at least one number";
                        
                        setPasswordValidation({
                          isValid,
                          message,
                          strength
                        });
                      } else {
                        setPasswordValidation({
                          isValid: true,
                          message: "",
                          strength: 0
                        });
                      }
                      
                      // Re-validate confirm password
                      if (formData.confirmPassword.length > 0) {
                        const passwordsMatch = value === formData.confirmPassword;
                        setConfirmPasswordValidation({
                          isValid: passwordsMatch,
                          message: passwordsMatch ? "" : "Passwords do not match"
                        });
                      }
                    }}
                    className={`mt-3 w-full rounded-lg border px-5.5 py-3 text-dark placeholder:text-dark-6 outline-none transition focus:border-primary dark:bg-dark-2 dark:text-white ${
                      passwordValidation.isValid 
                        ? "border-stroke dark:border-dark-3" 
                        : "border-red-500 dark:border-red-400"
                    }`}
                  required
                />
                  {formData.password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-dark-6 dark:text-dark-4 mb-1">
                        <span>Password strength:</span>
                        <span className={
                          passwordValidation.strength <= 1 ? "text-red-500" :
                          passwordValidation.strength <= 2 ? "text-orange-500" :
                          passwordValidation.strength <= 3 ? "text-yellow-500" :
                          passwordValidation.strength <= 4 ? "text-blue-500" :
                          "text-green-500"
                        }>
                          {passwordValidation.strength <= 1 ? "Weak" :
                           passwordValidation.strength <= 2 ? "Fair" :
                           passwordValidation.strength <= 3 ? "Good" :
                           passwordValidation.strength <= 4 ? "Strong" :
                           "Very Strong"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-dark-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordValidation.strength <= 1 ? "bg-red-500 w-1/5" :
                            passwordValidation.strength <= 2 ? "bg-orange-500 w-2/5" :
                            passwordValidation.strength <= 3 ? "bg-yellow-500 w-3/5" :
                            passwordValidation.strength <= 4 ? "bg-blue-500 w-4/5" :
                            "bg-green-500 w-full"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                  {!passwordValidation.isValid && passwordValidation.message && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      {passwordValidation.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-body-sm font-medium text-dark dark:text-white">
                    Confirm Password
                    <span className="ml-1 select-none text-red">*</span>
                  </label>
                  <input
                  type="password"
                  placeholder="Confirm your password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, confirmPassword: value }));
                      
                      // Confirm password validation
                      if (value.length > 0) {
                        const passwordsMatch = value === formData.password;
                        setConfirmPasswordValidation({
                          isValid: passwordsMatch,
                          message: passwordsMatch ? "" : "Passwords do not match"
                        });
                      } else {
                        setConfirmPasswordValidation({
                          isValid: true,
                          message: ""
                        });
                      }
                    }}
                    className={`mt-3 w-full rounded-lg border px-5.5 py-3 text-dark placeholder:text-dark-6 outline-none transition focus:border-primary dark:bg-dark-2 dark:text-white ${
                      confirmPasswordValidation.isValid 
                        ? "border-stroke dark:border-dark-3" 
                        : "border-red-500 dark:border-red-400"
                    }`}
                  required
                />
                  {!confirmPasswordValidation.isValid && confirmPasswordValidation.message && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      {confirmPasswordValidation.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-stroke bg-transparent text-primary focus:ring-primary dark:border-dark-3"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-dark-6 dark:text-dark-4">
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {submitMessage.message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {submitMessage.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg px-6 py-3 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-opacity-90'
                  }`}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="text-center">
                  <p className="text-sm text-dark-6 dark:text-dark-4">
                    Already have an account?{" "}
                    <a href="/sign-in" className="text-primary hover:underline">
                      Sign in
                    </a>
                  </p>
                </div>
              </form>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-stroke bg-white px-6 py-3 font-medium text-dark transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
              >
                ← Go back to home page
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;
