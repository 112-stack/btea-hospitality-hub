import React, { useState, useEffect } from 'react';
import { useOutletForm } from '../hooks/useOutletForm';
import { OUTLET_TYPES, MANAGEMENT_TYPES } from '../utils/constants';

const OutletForm = ({ mode = 'create', initialData = null, onSubmit, onCancel }) => {
  const {
    formData,
    errors,
    showLeasing,
    showRamadanFields,
    showRamadanAtts,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    validateForm,
    resetForm
  } = useOutletForm(initialData);

  const [showPOSName, setShowPOSName] = useState(false);

  const handlePOSExistChange = (e) => {
    const checked = e.target.checked;
    setShowPOSName(checked);
    handleInputChange('is_pos_exist', checked);

    if (!checked) {
      handleInputChange('pos_name', '');
    }
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const result = await handleSubmit();
      if (result && onSubmit) {
        onSubmit(result);
      }
    }
  };

  return (
    <div className="modal fade show d-block" id="outletFormModal" tabIndex="-1">
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header bg-light">
            <h1 className="modal-title fs-4 fw-bold">
              <i className="fa-solid fa-store me-2"></i>
              {mode === 'create' ? 'Add New Outlet' : 'Edit Outlet'}
            </h1>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            <form id="outlet_form" onSubmit={onFormSubmit} noValidate>

              {/* Basic Information Section */}
              <div className="section-header mb-3">
                <h5 className="text-primary mb-0">
                  <i className="fa-solid fa-info-circle me-2"></i>
                  Basic Information
                </h5>
                <hr className="mt-2" />
              </div>

              {/* Outlet Name (English) */}
              <div className="row mb-3">
                <label htmlFor="outlet_name_english" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                  Name (English) <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    id="outlet_name_english"
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter outlet name in English"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block">{errors.name}</div>
                  )}
                </div>
              </div>

              {/* Outlet Name (Arabic) */}
              <div className="row mb-3">
                <label htmlFor="outlet_name_arabic" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                  Name (Arabic) <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    id="outlet_name_arabic"
                    type="text"
                    name="arabic_name"
                    className={`form-control ${errors.arabic_name ? 'is-invalid' : ''}`}
                    placeholder="أدخل اسم المنفذ بالعربية"
                    dir="rtl"
                    value={formData.arabic_name || ''}
                    onChange={(e) => handleInputChange('arabic_name', e.target.value)}
                    required
                  />
                  {errors.arabic_name && (
                    <div className="invalid-feedback d-block">{errors.arabic_name}</div>
                  )}
                </div>
              </div>

              {/* Outlet Type */}
              <div className="row mb-3">
                <label htmlFor="outlet_type" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                  Type <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <select
                    id="outlet_type"
                    name="type"
                    className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                    value={formData.type || ''}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    required
                  >
                    <option value="">-- Select Outlet Type --</option>
                    <option value={OUTLET_TYPES.RAMADAN_TENT}>Ramadan Tent</option>
                    <option value={OUTLET_TYPES.RESTAURANT_SPECIALTY}>Specialty Restaurant</option>
                    <option value={OUTLET_TYPES.LOUNGE}>Lounge</option>
                    <option value={OUTLET_TYPES.MAIN_RESTAURANT}>All Day Dining</option>
                    <option value={OUTLET_TYPES.CLUB_LOUNGE}>Club Lounge</option>
                    <option value={OUTLET_TYPES.CAFE}>Cafe</option>
                    <option value={OUTLET_TYPES.FINE_DINING}>Fine Dining</option>
                  </select>
                  {errors.type && (
                    <div className="invalid-feedback d-block">{errors.type}</div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="row mb-3">
                <label htmlFor="outlet_location" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                  Location <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    id="outlet_location"
                    type="text"
                    name="location"
                    className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                    placeholder="e.g., Floor 2, Building A"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                  <div className="form-text">Specify the floor number or location details</div>
                  {errors.location && (
                    <div className="invalid-feedback d-block">{errors.location}</div>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div className="row mb-3">
                <label htmlFor="outlet_capacity" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                  Capacity <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <div className="input-group">
                    <input
                      id="outlet_capacity"
                      type="number"
                      name="capacity"
                      className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
                      placeholder="Maximum number of customers"
                      min="1"
                      max="9999"
                      value={formData.capacity || ''}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      required
                    />
                    <span className="input-group-text">
                      <i className="fa-solid fa-users"></i>
                    </span>
                  </div>
                  <div className="form-text">Maximum capacity of customers allowed</div>
                  {errors.capacity && (
                    <div className="invalid-feedback d-block">{errors.capacity}</div>
                  )}
                </div>
              </div>

              {/* Is Serving Hookah */}
              <div className="row mb-4">
                <label className="col-sm-3 col-form-label text-sm-end fw-semibold">
                  Serving Hookah? <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <div className="btn-group" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="is_serving_hookah"
                      id="hookah_yes"
                      value="true"
                      checked={formData.is_serving_hookah === true}
                      onChange={() => handleInputChange('is_serving_hookah', true)}
                      required
                    />
                    <label className="btn btn-outline-success" htmlFor="hookah_yes">
                      <i className="fa-solid fa-check me-1"></i> Yes
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="is_serving_hookah"
                      id="hookah_no"
                      value="false"
                      checked={formData.is_serving_hookah === false}
                      onChange={() => handleInputChange('is_serving_hookah', false)}
                      required
                    />
                    <label className="btn btn-outline-danger" htmlFor="hookah_no">
                      <i className="fa-solid fa-times me-1"></i> No
                    </label>
                  </div>
                  {errors.is_serving_hookah && (
                    <div className="invalid-feedback d-block">{errors.is_serving_hookah}</div>
                  )}
                </div>
              </div>

              {/* POS Information Section */}
              <div className="card border-primary mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fa-solid fa-cash-register me-2"></i>
                    Point of Sale (POS) Information
                  </h5>
                </div>
                <div className="card-body">

                  {/* POS Exists */}
                  <div className="row mb-3">
                    <label className="col-sm-3 col-form-label text-sm-end fw-semibold">
                      POS System Exists?
                    </label>
                    <div className="col-sm-9">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="outlet_is_pos_exist"
                          checked={formData.is_pos_exist || false}
                          onChange={handlePOSExistChange}
                          role="switch"
                        />
                        <label className="form-check-label" htmlFor="outlet_is_pos_exist">
                          Yes, this outlet has a POS system
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* POS Name */}
                  {showPOSName && (
                    <div className="row mb-3">
                      <label htmlFor="outlet_pos_name" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                        POS Name
                      </label>
                      <div className="col-sm-9">
                        <input
                          id="outlet_pos_name"
                          type="text"
                          name="pos_name"
                          className="form-control"
                          placeholder="e.g., Oracle Micros, Toast POS"
                          value={formData.pos_name || ''}
                          onChange={(e) => handleInputChange('pos_name', e.target.value)}
                        />
                        <div className="form-text">Enter the name/brand of the POS system</div>
                      </div>
                    </div>
                  )}

                  {/* POS Integrated */}
                  <div className="row mb-3">
                    <label className="col-sm-3 col-form-label text-sm-end fw-semibold">
                      POS Integrated?
                    </label>
                    <div className="col-sm-9">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="outlet_is_pos_integrated"
                          checked={formData.pos_integrated || false}
                          onChange={(e) => handleInputChange('pos_integrated', e.target.checked)}
                          role="switch"
                        />
                        <label className="form-check-label" htmlFor="outlet_is_pos_integrated">
                          Yes, POS is integrated with hotel management system
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* PMS ID */}
                  <div className="row mb-3">
                    <label htmlFor="outlet_pms_id" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                      PMS ID <span className="text-danger">*</span>
                    </label>
                    <div className="col-sm-9">
                      <input
                        id="outlet_pms_id"
                        type="text"
                        name="pms_id"
                        className={`form-control ${errors.pms_id ? 'is-invalid' : ''}`}
                        placeholder="Property Management System ID"
                        value={formData.pms_id || ''}
                        onChange={(e) => handleInputChange('pms_id', e.target.value)}
                        required
                      />
                      <div className="form-text">Enter the PMS identifier</div>
                      {errors.pms_id && (
                        <div className="invalid-feedback d-block">{errors.pms_id}</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Management Information Section */}
              <div className="card border-success mb-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="fa-solid fa-user-tie me-2"></i>
                    Management Information
                  </h5>
                </div>
                <div className="card-body">

                  {/* Management Type */}
                  <div className="row mb-3">
                    <label htmlFor="outlet_management_type" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                      Management Type <span className="text-danger">*</span>
                    </label>
                    <div className="col-sm-9">
                      <select
                        id="outlet_management_type"
                        name="management_type"
                        className={`form-select ${errors.management_type ? 'is-invalid' : ''}`}
                        value={formData.management_type || MANAGEMENT_TYPES.SELF_OPERATED}
                        onChange={(e) => handleInputChange('management_type', e.target.value)}
                        required
                      >
                        <option value={MANAGEMENT_TYPES.SELF_OPERATED}>Self Operated</option>
                        <option value={MANAGEMENT_TYPES.OUTSOURCED}>Outsourced</option>
                      </select>
                      {errors.management_type && (
                        <div className="invalid-feedback d-block">{errors.management_type}</div>
                      )}
                    </div>
                  </div>

                  {/* Manager Name */}
                  <div className="row mb-3">
                    <label htmlFor="outlet_manager_name" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                      Manager Name <span className="text-danger">*</span>
                    </label>
                    <div className="col-sm-9">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa-solid fa-user"></i>
                        </span>
                        <input
                          id="outlet_manager_name"
                          type="text"
                          name="manager_name"
                          className={`form-control ${errors.manager_name ? 'is-invalid' : ''}`}
                          placeholder="Full name of the manager"
                          value={formData.manager_name || ''}
                          onChange={(e) => handleInputChange('manager_name', e.target.value)}
                          required
                        />
                      </div>
                      {errors.manager_name && (
                        <div className="invalid-feedback d-block">{errors.manager_name}</div>
                      )}
                    </div>
                  </div>

                  {/* Manager CPR */}
                  <div className="row mb-3">
                    <label htmlFor="outlet_manager_cpr" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                      Manager CPR <span className="text-danger">*</span>
                    </label>
                    <div className="col-sm-9">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa-solid fa-id-card"></i>
                        </span>
                        <input
                          id="outlet_manager_cpr"
                          type="text"
                          name="manager_cpr"
                          className={`form-control ${errors.manager_cpr ? 'is-invalid' : ''}`}
                          placeholder="Civil Personal Registration number"
                          pattern="[0-9]{9}"
                          maxLength="9"
                          value={formData.manager_cpr || ''}
                          onChange={(e) => handleInputChange('manager_cpr', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-text">9-digit CPR number</div>
                      {errors.manager_cpr && (
                        <div className="invalid-feedback d-block">{errors.manager_cpr}</div>
                      )}
                    </div>
                  </div>

                  {/* Manager Phone */}
                  <div className="row mb-3">
                    <label htmlFor="outlet_manager_phone" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                      Manager Phone <span className="text-danger">*</span>
                    </label>
                    <div className="col-sm-9">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa-solid fa-phone"></i>
                        </span>
                        <input
                          id="outlet_manager_phone"
                          type="tel"
                          name="manager_phone"
                          className={`form-control ${errors.manager_phone ? 'is-invalid' : ''}`}
                          placeholder="+973 XXXX XXXX"
                          value={formData.manager_phone || ''}
                          onChange={(e) => handleInputChange('manager_phone', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-text">Contact phone number with country code</div>
                      {errors.manager_phone && (
                        <div className="invalid-feedback d-block">{errors.manager_phone}</div>
                      )}
                    </div>
                  </div>

                  {/* Manager Email */}
                  <div className="row mb-3">
                    <label htmlFor="outlet_manager_email" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                      Manager Email <span className="text-danger">*</span>
                    </label>
                    <div className="col-sm-9">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa-solid fa-envelope"></i>
                        </span>
                        <input
                          id="outlet_manager_email"
                          type="email"
                          name="manager_email"
                          className={`form-control ${errors.manager_email ? 'is-invalid' : ''}`}
                          placeholder="manager@example.com"
                          maxLength="100"
                          value={formData.manager_email || ''}
                          onChange={(e) => handleInputChange('manager_email', e.target.value)}
                          required
                        />
                      </div>
                      {errors.manager_email && (
                        <div className="invalid-feedback d-block">{errors.manager_email}</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Leasing Contract Section (Conditional) */}
              {showLeasing && (
                <div className="card border-warning mb-4">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <i className="fa-solid fa-file-contract me-2"></i>
                      Leasing Contract Information
                    </h5>
                  </div>
                  <div className="card-body">

                    {/* Leasing Office CR */}
                    <div className="row mb-3">
                      <label htmlFor="leasing_office_cr" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                        Leasing Office (CR) <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-9">
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa-solid fa-building"></i>
                          </span>
                          <input
                            id="leasing_office_cr"
                            type="text"
                            name="leasing_office_cr"
                            className={`form-control ${errors.leasing_office_cr ? 'is-invalid' : ''}`}
                            placeholder="Commercial Registration Number"
                            value={formData.leasing_office_cr || ''}
                            onChange={(e) => handleInputChange('leasing_office_cr', e.target.value)}
                          />
                        </div>
                        <div className="form-text">Enter the CR number to auto-fill office details</div>
                        {errors.leasing_office_cr && (
                          <div className="invalid-feedback d-block">{errors.leasing_office_cr}</div>
                        )}
                      </div>
                    </div>

                    {/* Contract Dates */}
                    <div className="row mb-3">
                      <label htmlFor="leased_from" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                        Contract Start Date <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="date"
                          id="leased_from"
                          name="leased_from"
                          className={`form-control ${errors.leased_from ? 'is-invalid' : ''}`}
                          value={formData.leased_from || ''}
                          onChange={(e) => handleInputChange('leased_from', e.target.value)}
                        />
                        {errors.leased_from && (
                          <div className="invalid-feedback d-block">{errors.leased_from}</div>
                        )}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <label htmlFor="leased_to" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                        Contract End Date <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="date"
                          id="leased_to"
                          name="leased_to"
                          className={`form-control ${errors.leased_to ? 'is-invalid' : ''}`}
                          value={formData.leased_to || ''}
                          onChange={(e) => handleInputChange('leased_to', e.target.value)}
                        />
                        {errors.leased_to && (
                          <div className="invalid-feedback d-block">{errors.leased_to}</div>
                        )}
                      </div>
                    </div>

                    {/* Leasing Contract Document */}
                    <div className="row mb-3">
                      <label htmlFor="att_leasing" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                        Contract Document <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="file"
                          id="att_leasing"
                          name="att_leasing"
                          className="form-control"
                          accept=".pdf"
                          onChange={(e) => handleFileChange('att_leasing', e.target.files[0])}
                        />
                        <div className="form-text">Upload the leasing contract (PDF - Max 10MB)</div>
                        {errors.att_leasing && (
                          <div className="invalid-feedback d-block">{errors.att_leasing}</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Ramadan Tent Information Section (Conditional) */}
              {showRamadanFields && (
                <div className="card border-info mb-4">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                      <i className="fa-solid fa-mosque me-2"></i>
                      Ramadan Tent Information
                    </h5>
                  </div>
                  <div className="card-body">

                    {/* Location Arabic */}
                    <div className="row mb-3">
                      <label htmlFor="ramadan_tent_loc_ar" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                        Location (Arabic) <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-9">
                        <textarea
                          id="ramadan_tent_loc_ar"
                          name="ramadan_tent_loc_ar"
                          className={`form-control ${errors.ramadan_tent_loc_ar ? 'is-invalid' : ''}`}
                          rows="3"
                          maxLength="199"
                          placeholder="وصف موقع خيمة رمضان"
                          dir="rtl"
                          value={formData.ramadan_tent_loc_ar || ''}
                          onChange={(e) => handleInputChange('ramadan_tent_loc_ar', e.target.value)}
                        />
                        <div className="form-text">Maximum 199 characters</div>
                        {errors.ramadan_tent_loc_ar && (
                          <div className="invalid-feedback d-block">{errors.ramadan_tent_loc_ar}</div>
                        )}
                      </div>
                    </div>

                    {/* Location English */}
                    <div className="row mb-3">
                      <label htmlFor="ramadan_tent_loc_en" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                        Location (English) <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-9">
                        <textarea
                          id="ramadan_tent_loc_en"
                          name="ramadan_tent_loc_en"
                          className={`form-control ${errors.ramadan_tent_loc_en ? 'is-invalid' : ''}`}
                          rows="3"
                          maxLength="199"
                          placeholder="Describe the Ramadan tent location"
                          value={formData.ramadan_tent_loc_en || ''}
                          onChange={(e) => handleInputChange('ramadan_tent_loc_en', e.target.value)}
                        />
                        <div className="form-text">Maximum 199 characters</div>
                        {errors.ramadan_tent_loc_en && (
                          <div className="invalid-feedback d-block">{errors.ramadan_tent_loc_en}</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Ramadan Tent Attachments Section (Conditional) */}
              {showRamadanAtts && (
                <div className="card border-danger mb-4">
                  <div className="card-header bg-danger text-white">
                    <h5 className="mb-0">
                      <i className="fa-solid fa-file-upload me-2"></i>
                      Ramadan Tent Required Documents
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-info mb-3">
                      <i className="fa-solid fa-info-circle me-2"></i>
                      All documents are required for Ramadan Tent outlets. Please ensure files are in PDF format and do not exceed 10MB each.
                    </div>

                    {/* Civil Defence Approval */}
                    <div className="row mb-3">
                      <label htmlFor="att_1" className="col-sm-5 col-form-label text-sm-end fw-semibold">
                        General Directorate of Civil Defence <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-7">
                        <input
                          type="file"
                          id="att_1"
                          name="att_1"
                          className="form-control"
                          accept=".pdf"
                          onChange={(e) => handleFileChange('att_1', e.target.files[0])}
                        />
                        <div className="form-text">Civil Defence approval letter (PDF)</div>
                      </div>
                    </div>

                    {/* Ministry of Health Approval */}
                    <div className="row mb-3">
                      <label htmlFor="att_2" className="col-sm-5 col-form-label text-sm-end fw-semibold">
                        Ministry of Health - Public Health Directorate <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-7">
                        <input
                          type="file"
                          id="att_2"
                          name="att_2"
                          className="form-control"
                          accept=".pdf"
                          onChange={(e) => handleFileChange('att_2', e.target.files[0])}
                        />
                        <div className="form-text">Health approval letter (PDF)</div>
                      </div>
                    </div>

                    {/* Posture Attachment */}
                    <div className="row mb-3">
                      <label htmlFor="att_3" className="col-sm-5 col-form-label text-sm-end fw-semibold">
                        Posture/Layout Document <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-7">
                        <input
                          type="file"
                          id="att_3"
                          name="att_3"
                          className="form-control"
                          accept=".pdf"
                          onChange={(e) => handleFileChange('att_3', e.target.files[0])}
                        />
                        <div className="form-text">Tent layout/posture plan (PDF)</div>
                      </div>
                    </div>

                    {/* Ministry of Municipalities Approval */}
                    <div className="row mb-3">
                      <label htmlFor="att_4" className="col-sm-5 col-form-label text-sm-end fw-semibold">
                        Ministry of Municipalities Affairs and Agriculture <span className="text-danger">*</span>
                      </label>
                      <div className="col-sm-7">
                        <input
                          type="file"
                          id="att_4"
                          name="att_4"
                          className="form-control"
                          accept=".pdf"
                          onChange={(e) => handleFileChange('att_4', e.target.files[0])}
                        />
                        <div className="form-text">Municipality approval letter (PDF)</div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              <i className="fa-solid fa-times me-2"></i>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" onClick={onFormSubmit}>
              <i className={`fa-solid ${mode === 'create' ? 'fa-plus' : 'fa-save'} me-2`}></i>
              {mode === 'create' ? 'Create Outlet' : 'Update Outlet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutletForm;
