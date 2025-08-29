import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';

const MedicineDonation = () => {
  const { getAuthHeaders } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' });
  const formRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    medicineName: '',
    genericName: '',
    brand: '',
    dosage: '',
    form: 'tablet',
    quantity: '',
    unit: 'pieces',
    expiryDate: '',
    manufacturingDate: '',
    batchNumber: '',
    manufacturer: '',
    description: '',
    reason: '',
    condition: 'excellent',
    unopened: true,
    donorContact: {
      phone: '',
      email: '',
      preferredContactMethod: 'both'
    },
    pickupLocation: {
      address: '',
      city: '',
      postalCode: '',
      additionalInfo: ''
    },
    availability: {
      availableDays: [],
      availableTime: {
        from: '09:00',
        to: '17:00'
      }
    }
  });

  const [errors, setErrors] = useState({});

  const medicineFormOptions = [
    'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'
  ];

  const unitOptions = [
    'pieces', 'bottles', 'tubes', 'vials', 'boxes', 'strips'
  ];

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        availableDays: prev.availability.availableDays.includes(day)
          ? prev.availability.availableDays.filter(d => d !== day)
          : [...prev.availability.availableDays, day]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.medicineName.trim()) newErrors.medicineName = 'Medicine name is required';
    if (!formData.dosage.trim()) newErrors.dosage = 'Dosage is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.manufacturingDate) newErrors.manufacturingDate = 'Manufacturing date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for donation is required';
    if (!formData.donorContact.phone.trim()) newErrors['donorContact.phone'] = 'Phone number is required';
    if (!formData.donorContact.email.trim()) newErrors['donorContact.email'] = 'Email is required';
    if (!formData.pickupLocation.address.trim()) newErrors['pickupLocation.address'] = 'Address is required';
    if (!formData.pickupLocation.city.trim()) newErrors['pickupLocation.city'] = 'City is required';
    if (!formData.pickupLocation.postalCode.trim()) newErrors['pickupLocation.postalCode'] = 'Postal code is required';

    // Date validation
    const expiryDate = new Date(formData.expiryDate);
    const manufacturingDate = new Date(formData.manufacturingDate);
    const today = new Date();

    if (expiryDate <= today) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }

    if (manufacturingDate >= expiryDate) {
      newErrors.manufacturingDate = 'Manufacturing date must be before expiry date';
    }

    // Available days validation
    if (formData.availability.availableDays.length === 0) {
      newErrors.availableDays = 'Please select at least one available day';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.donorContact.email && !emailRegex.test(formData.donorContact.email)) {
      newErrors['donorContact.email'] = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setModalContent({
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting.',
        type: 'error'
      });
      setShowModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/donations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setModalContent({
          title: 'Success!',
          message: 'Your donation has been submitted successfully! It will be reviewed by our admin team.',
          type: 'success'
        });
        setShowModal(true);
        
        // Reset form
        formRef.current?.reset();
        setFormData({
          medicineName: '',
          genericName: '',
          brand: '',
          dosage: '',
          form: 'tablet',
          quantity: '',
          unit: 'pieces',
          expiryDate: '',
          manufacturingDate: '',
          batchNumber: '',
          manufacturer: '',
          description: '',
          reason: '',
          condition: 'excellent',
          unopened: true,
          donorContact: {
            phone: '',
            email: '',
            preferredContactMethod: 'both'
          },
          pickupLocation: {
            address: '',
            city: '',
            postalCode: '',
            additionalInfo: ''
          },
          availability: {
            availableDays: [],
            availableTime: {
              from: '09:00',
              to: '17:00'
            }
          }
        });
        setErrors({});
      } else {
        throw new Error(data.message || 'Failed to submit donation');
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      setModalContent({
        title: 'Error',
        message: error.message || 'Failed to submit donation. Please try again.',
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Donate Medicine
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Help others by donating unused medicines. All donations are reviewed by our team before being made available.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        {/* Medicine Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Medicine Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Medicine Name *
              </label>
              <input
                type="text"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors.medicineName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter medicine name"
              />
              {errors.medicineName && (
                <p className="text-red-500 text-sm mt-1">{errors.medicineName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Generic Name
              </label>
              <input
                type="text"
                name="genericName"
                value={formData.genericName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                placeholder="Enter generic name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dosage *
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors.dosage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 500mg, 10ml"
              />
              {errors.dosage && (
                <p className="text-red-500 text-sm mt-1">{errors.dosage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Form *
              </label>
              <select
                name="form"
                value={formData.form}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              >
                {medicineFormOptions.map(form => (
                  <option key={form} value={form}>
                    {form.charAt(0).toUpperCase() + form.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity *
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity"
                />
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                >
                  {unitOptions.map(unit => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manufacturing Date *
              </label>
              <input
                type="date"
                name="manufacturingDate"
                value={formData.manufacturingDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors.manufacturingDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.manufacturingDate && (
                <p className="text-red-500 text-sm mt-1">{errors.manufacturingDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                placeholder="Enter batch number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                placeholder="Enter manufacturer name"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medicine Condition *
            </label>
            <div className="flex space-x-4">
              {['excellent', 'good', 'fair'].map(condition => (
                <label key={condition} className="flex items-center">
                  <input
                    type="radio"
                    name="condition"
                    value={condition}
                    checked={formData.condition === condition}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {condition}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="unopened"
                checked={formData.unopened}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Medicine is unopened/sealed
              </span>
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              placeholder="Additional information about the medicine"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Donation *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows="2"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Why are you donating this medicine?"
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="donorContact.phone"
                value={formData.donorContact.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors['donorContact.phone'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors['donorContact.phone'] && (
                <p className="text-red-500 text-sm mt-1">{errors['donorContact.phone']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="donorContact.email"
                value={formData.donorContact.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors['donorContact.email'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors['donorContact.email'] && (
                <p className="text-red-500 text-sm mt-1">{errors['donorContact.email']}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Contact Method
            </label>
            <select
              name="donorContact.preferredContactMethod"
              value={formData.donorContact.preferredContactMethod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
            >
              <option value="both">Both Phone & Email</option>
              <option value="phone">Phone Only</option>
              <option value="email">Email Only</option>
            </select>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Pickup Location
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address *
              </label>
              <textarea
                name="pickupLocation.address"
                value={formData.pickupLocation.address}
                onChange={handleInputChange}
                rows="2"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors['pickupLocation.address'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full address"
              />
              {errors['pickupLocation.address'] && (
                <p className="text-red-500 text-sm mt-1">{errors['pickupLocation.address']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                name="pickupLocation.city"
                value={formData.pickupLocation.city}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors['pickupLocation.city'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city"
              />
              {errors['pickupLocation.city'] && (
                <p className="text-red-500 text-sm mt-1">{errors['pickupLocation.city']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                name="pickupLocation.postalCode"
                value={formData.pickupLocation.postalCode}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 ${
                  errors['pickupLocation.postalCode'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter postal code"
              />
              {errors['pickupLocation.postalCode'] && (
                <p className="text-red-500 text-sm mt-1">{errors['pickupLocation.postalCode']}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Information
              </label>
              <textarea
                name="pickupLocation.additionalInfo"
                value={formData.pickupLocation.additionalInfo}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                placeholder="Landmarks, special instructions, etc."
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Availability for Pickup
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Days *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {daysOfWeek.map(day => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.availability.availableDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {day.slice(0, 3)}
                  </span>
                </label>
              ))}
            </div>
            {errors.availableDays && (
              <p className="text-red-500 text-sm mt-1">{errors.availableDays}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available From
              </label>
              <input
                type="time"
                name="availability.availableTime.from"
                value={formData.availability.availableTime.from}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available To
              </label>
              <input
                type="time"
                name="availability.availableTime.to"
                value={formData.availability.availableTime.to}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
                formRef.current?.reset();
                setFormData({
                  medicineName: '',
                  genericName: '',
                  brand: '',
                  dosage: '',
                  form: 'tablet',
                  quantity: '',
                  unit: 'pieces',
                  expiryDate: '',
                  manufacturingDate: '',
                  batchNumber: '',
                  manufacturer: '',
                  description: '',
                  reason: '',
                  condition: 'excellent',
                  unopened: true,
                  donorContact: {
                    phone: '',
                    email: '',
                    preferredContactMethod: 'both'
                  },
                  pickupLocation: {
                    address: '',
                    city: '',
                    postalCode: '',
                    additionalInfo: ''
                  },
                  availability: {
                    availableDays: [],
                    availableTime: {
                      from: '09:00',
                      to: '17:00'
                    }
                  }
                });
                setErrors({});
              }
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Donation'}
          </button>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalContent.title}
          type={modalContent.type}
        >
          <p className="text-gray-600 dark:text-gray-300">
            {modalContent.message}
          </p>
        </Modal>
      )}
    </div>
  );
};

export default MedicineDonation;