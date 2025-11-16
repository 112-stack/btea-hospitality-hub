import { useState, useEffect, useCallback } from 'react';
import { OUTLET_TYPES, MANAGEMENT_TYPES } from '../utils/constants';

export const useOutletForm = (initialData = null) => {
  const [formData, setFormData] = useState({
    name: '',
    arabic_name: '',
    type: '',
    location: '',
    capacity: '',
    is_serving_hookah: null,
    is_pos_exist: false,
    pos_name: '',
    pos_integrated: false,
    pms_id: '',
    management_type: MANAGEMENT_TYPES.SELF_OPERATED,
    manager_name: '',
    manager_cpr: '',
    manager_phone: '',
    manager_email: '',
    leasing_office_cr: '',
    leased_from: '',
    leased_to: '',
    ramadan_tent_loc_ar: '',
    ramadan_tent_loc_en: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({});

  // Computed states
  const showLeasing = formData.management_type === MANAGEMENT_TYPES.OUTSOURCED;
  const showRamadanFields = formData.type === OUTLET_TYPES.RAMADAN_TENT.toString();
  const showRamadanAtts = formData.type === OUTLET_TYPES.RAMADAN_TENT.toString();

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle file changes
  const handleFileChange = useCallback((field, file) => {
    // Validate file
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = ['application/pdf'];

      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [field]: 'File size must be less than 10MB'
        }));
        return;
      }

      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [field]: 'Only PDF files are allowed'
        }));
        return;
      }

      setFiles(prev => ({
        ...prev,
        [field]: file
      }));

      // Clear error
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  }, [errors]);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required text fields
    const requiredFields = [
      { field: 'name', message: 'Outlet English Name is required' },
      { field: 'arabic_name', message: 'Outlet Arabic Name is required' },
      { field: 'type', message: 'Outlet Type is required' },
      { field: 'location', message: 'Outlet Location is required' },
      { field: 'capacity', message: 'Outlet Capacity is required' },
      { field: 'pms_id', message: 'PMS ID is required' },
      { field: 'manager_name', message: 'Manager Name is required' },
      { field: 'manager_cpr', message: 'Manager CPR is required' },
      { field: 'manager_phone', message: 'Manager Phone is required' },
      { field: 'manager_email', message: 'Manager Email is required' }
    ];

    requiredFields.forEach(({ field, message }) => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = message;
      }
    });

    // Hookah service validation
    if (formData.is_serving_hookah === null) {
      newErrors.is_serving_hookah = 'Please select whether the outlet serves hookah';
    }

    // Capacity validation
    if (formData.capacity) {
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity < 1 || capacity > 9999) {
        newErrors.capacity = 'Capacity must be between 1 and 9999';
      }
    }

    // CPR validation
    if (formData.manager_cpr && !/^[0-9]{9}$/.test(formData.manager_cpr)) {
      newErrors.manager_cpr = 'CPR must be exactly 9 digits';
    }

    // Email validation
    if (formData.manager_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.manager_email)) {
      newErrors.manager_email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.manager_phone && !/^[+0-9\s\-]{8,15}$/.test(formData.manager_phone)) {
      newErrors.manager_phone = 'Please enter a valid phone number';
    }

    // POS Name validation
    if (formData.is_pos_exist && !formData.pos_name) {
      newErrors.pos_name = 'POS Name is required when POS exists';
    }

    // Leasing validation
    if (showLeasing) {
      if (!formData.leasing_office_cr) {
        newErrors.leasing_office_cr = 'Leasing Office CR is required';
      }
      if (!formData.leased_from) {
        newErrors.leased_from = 'Contract Start Date is required';
      }
      if (!formData.leased_to) {
        newErrors.leased_to = 'Contract End Date is required';
      }
      if (!files.att_leasing) {
        newErrors.att_leasing = 'Leasing Contract document is required';
      }
    }

    // Ramadan Tent validation
    if (showRamadanFields) {
      if (!formData.ramadan_tent_loc_ar) {
        newErrors.ramadan_tent_loc_ar = 'Location (Arabic) is required for Ramadan Tent';
      }
      if (!formData.ramadan_tent_loc_en) {
        newErrors.ramadan_tent_loc_en = 'Location (English) is required for Ramadan Tent';
      }

      // Required documents
      const requiredDocs = ['att_1', 'att_2', 'att_3', 'att_4'];
      const docNames = {
        att_1: 'Civil Defence approval',
        att_2: 'Ministry of Health approval',
        att_3: 'Posture Attachment',
        att_4: 'Ministry of Municipalities approval'
      };

      requiredDocs.forEach(doc => {
        if (!files[doc]) {
          newErrors[doc] = `${docNames[doc]} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, files, showLeasing, showRamadanFields]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return false;
    }

    // Create FormData for file upload
    const submitData = new FormData();

    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    // Append all files
    Object.keys(files).forEach(key => {
      if (files[key]) {
        submitData.append(key, files[key]);
      }
    });

    return submitData;
  }, [formData, files, validateForm]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      arabic_name: '',
      type: '',
      location: '',
      capacity: '',
      is_serving_hookah: null,
      is_pos_exist: false,
      pos_name: '',
      pos_integrated: false,
      pms_id: '',
      management_type: MANAGEMENT_TYPES.SELF_OPERATED,
      manager_name: '',
      manager_cpr: '',
      manager_phone: '',
      manager_email: '',
      leasing_office_cr: '',
      leased_from: '',
      leased_to: '',
      ramadan_tent_loc_ar: '',
      ramadan_tent_loc_en: ''
    });
    setFiles({});
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    files,
    showLeasing,
    showRamadanFields,
    showRamadanAtts,
    handleInputChange,
    handleFileChange,
    validateForm,
    handleSubmit,
    resetForm
  };
};
