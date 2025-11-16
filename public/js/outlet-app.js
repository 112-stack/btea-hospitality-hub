/**
 * BTEA Outlet Management Application
 * Vue.js Application for managing outlets
 */

const OUTLET_TYPES = {
    RESTAURANT_SPECIALTY: 449930000,
    LOUNGE: 449930001,
    MAIN_RESTAURANT: 449930002,
    CLUB_LOUNGE: 449930003,
    CAFE: 449930013,
    FINE_DINING: 449930016,
    RAMADAN_TENT: 449930017,
    SPA: 449930028
};

const MANAGEMENT_TYPES = {
    SELF_OPERATED: 449930000,
    OUTSOURCED: 449930001
};

const DB_STATUS = {
    UPDATE: 0,
    ADD: 1,
    DELETE: 2,
    NO_CHANGE: 3
};

// Vue Application
var vue = new Vue({
    el: '#outlet_form',

    data() {
        return {
            src: window.outletData || {
                outlets: [],
                outletTypes: [],
                managementTypes: [],
                offices: [],
                isBoutique: false,
                isExceptional: false,
                isApartmentHotel: false,
                stars: 0,
                rooms: 0,
                processingOutlets: [],
                inProcessOutlets: [],
                rInfo: {}
            },

            newOutlet: {},
            selectedOutlet: {},
            outletErrors: [],

            // UI State Flags
            showOutlets: true,
            showOptions: false,
            showEditForm: false,
            isOpenForEdit: false,

            // Service Selection Flags
            isChangNameSelected: false,
            isOpenOutletSelected: false,
            isCloseOutletSelected: false,
            isChangeLocSelected: false,
            isChangeTypeSelected: false,
            isChangeHookahServiceSelected: false,
            isDeleteOutletSelected: false,

            // Validation Flags
            isSelect_without_deleteOutlet: false,
            isDeleteOutlet: false,
            isFacility: false,

            // Leasing Office
            leased_office_name: '',
            leased_office_Id: '',
            leased_office_API_message: '',

            // Index for updates
            indexForUpdate: 0
        };
    },

    computed: {
        isSubmitButtonDisabled() {
            if (this.preSelectOutletType == OUTLET_TYPES.RAMADAN_TENT) {
                return false;
            }
            return this.outletErrors.length > 0 && !this.src.isExceptional;
        }
    },

    methods: {
        /**
         * Create new outlet
         */
        createNewOutlet() {
            this.resetLeasingOffice();
            this.isOpenForEdit = false;
            this.newOutlet = {
                status: "New",
                management_type: MANAGEMENT_TYPES.SELF_OPERATED,
                pos_integrated: false,
                isServingHookah: false
            };

            if (this.src.rInfo.start_date && this.src.rInfo.end_date) {
                this.newOutlet.ramadan_tent_from = moment(this.src.rInfo.start_date).format('YYYY-MM-DD');
                this.newOutlet.ramadan_tent_to = moment(this.src.rInfo.end_date).format('YYYY-MM-DD');
            }

            this.clearAttachments();
        },

        /**
         * Add new outlet to processing array
         */
        addNewOutletToArray(mode) {
            if (!this.validateNewOutlet()) {
                return;
            }

            const index = mode === "add" ? this.src.processingOutlets.length : this.indexForUpdate;

            // Handle outsourced management
            if (this.newOutlet.management_type == MANAGEMENT_TYPES.OUTSOURCED) {
                if (!this.validateOutsourced(index)) {
                    return;
                }
            }

            // Handle Ramadan Tent
            if (this.newOutlet.type == OUTLET_TYPES.RAMADAN_TENT) {
                if (!this.validateRamadanTent(index)) {
                    return;
                }
            }

            // Add or update
            if (mode === "add") {
                this.newOutlet.db_status = DB_STATUS.ADD;
                this.src.processingOutlets.push(this.newOutlet);
            } else {
                if (this.newOutlet.db_status == DB_STATUS.NO_CHANGE) {
                    this.newOutlet.db_status = DB_STATUS.UPDATE;
                }
                this.src.processingOutlets[this.indexForUpdate] = Object.assign({}, this.newOutlet);
            }

            $('#addNewOutletModal').modal('hide');
            this.validateOutlets();
        },

        /**
         * Validate new outlet form
         */
        validateNewOutlet() {
            const required = [
                { field: 'name', message: 'Outlet English Name' },
                { field: 'arabic_name', message: 'Outlet Arabic Name' },
                { field: 'type', message: 'Outlet Type' },
                { field: 'location', message: 'Outlet Location' },
                { field: 'capacity', message: 'Outlet Capacity' },
                { field: 'pms_id', message: 'Outlet PMS ID' },
                { field: 'management_type', message: 'Management Type' },
                { field: 'manager_name', message: 'Manager Name' },
                { field: 'manager_cpr', message: 'Manager CPR' },
                { field: 'manager_phone', message: 'Manager Phone' },
                { field: 'manager_email', message: 'Manager Email' }
            ];

            for (let item of required) {
                if (!this.newOutlet[item.field]) {
                    alert(`${item.message} is required`);
                    return false;
                }
            }

            if (this.newOutlet.is_pos_exist && !this.newOutlet.pos_name) {
                alert('POS Name is required when POS exists');
                return false;
            }

            return true;
        },

        /**
         * Validate outsourced management
         */
        validateOutsourced(index) {
            const fields = ['leased_from', 'leasing_office_cr', 'leased_to'];
            const messages = {
                leased_from: 'Leasing From Date',
                leasing_office_cr: 'Leasing Office (CR)',
                leased_to: 'Leasing To Date'
            };

            for (let field of fields) {
                const value = field === 'leased_from' || field === 'leased_to'
                    ? $(`#outlet_${field.replace('leased_', '')}`).val()
                    : field === 'leasing_office_cr'
                    ? $('#leasing_office_cr').val()
                    : null;

                if (!value) {
                    alert(`${messages[field]} is required`);
                    return false;
                }

                if (field === 'leased_from') {
                    this.newOutlet.leased_from = value;
                } else if (field === 'leased_to') {
                    this.newOutlet.leased_to = value;
                } else if (field === 'leasing_office_cr') {
                    this.newOutlet.leasing_office_cr = value;
                }
            }

            if (!this.leased_office_Id) {
                alert('Leasing Office is required');
                return false;
            }
            this.newOutlet.officeId = this.leased_office_Id;

            // Handle attachment
            if (!$('#att_leasing').val()) {
                alert('Leasing Attachment is required');
                return false;
            }

            this.cloneFileInput('att_leasing', index);
            return true;
        },

        /**
         * Validate Ramadan Tent
         */
        validateRamadanTent(index) {
            const status = this.newOutlet.app_status;

            if (status == 449930005 || status == 449930008) {
                // Upload documents required
                const attachments = ['att_1', 'att_2', 'att_3', 'att_4'];
                for (let att of attachments) {
                    if (!$(`#${att}`).val()) {
                        const names = {
                            att_1: 'Civil Defence approval',
                            att_2: 'Ministry of Health approval',
                            att_3: 'Posture Attachment',
                            att_4: 'Ministry of Municipalities approval'
                        };
                        alert(`${names[att]} is required`);
                        return false;
                    }
                    this.cloneFileInput(att, index);
                }
            } else {
                // Location fields required
                if (!$('#ramadan_tent_loc_en').val()) {
                    alert('Ramadan Tent Location (English) is required');
                    return false;
                }
                if (!$('#ramadan_tent_loc_ar').val()) {
                    alert('Ramadan Tent Location (Arabic) is required');
                    return false;
                }

                // Validate duration (max 90 days)
                const from = new Date($('#ramadan_tent_from').val()).getTime();
                const to = new Date($('#ramadan_tent_to').val()).getTime();
                const days = Math.ceil((to - from) / (1000 * 3600 * 24));

                if (days > 90) {
                    alert('Ramadan Tent duration cannot exceed 90 days');
                    return false;
                }
            }

            return true;
        },

        /**
         * Clone file input for form submission
         */
        cloneFileInput(inputId, index) {
            const fileInput = $(`#${inputId}`);
            const cloneInput = fileInput.clone();
            const newId = `outlet_${index}_${inputId}`;

            cloneInput.attr({
                id: newId,
                name: newId,
                hidden: true
            });

            cloneInput.insertAfter('#tst');
            this.newOutlet[inputId] = newId;
        },

        /**
         * Open edit form for existing outlet
         */
        openEditForm(outlet, index) {
            this.resetLeasingOffice();

            if (outlet.status === "New") {
                this.newOutlet = Object.assign({}, outlet);
                this.leased_office_name = outlet.officeName;
                this.leased_office_Id = outlet.officeId;
                this.newOutlet.leasing_office_cr = outlet.officeCR;
                $('#addNewOutletModal').modal('show');
            } else if (outlet.status === "Edit") {
                this.selectedOutlet = Object.assign({}, outlet);
                this.showOptions = false;
                this.showOutlets = false;
                this.showEditForm = true;

                // Set flags
                this.isChangNameSelected = outlet.isChangNameSelected;
                this.isChangeTypeSelected = outlet.isChangeTypeSelected;
                this.isChangeLocSelected = outlet.isChangeLocSelected;
                this.isCloseOutletSelected = outlet.isCloseOutletSelected;
                this.isOpenOutletSelected = outlet.isOpenOutletSelected;
                this.isChangeHookahServiceSelected = outlet.isChangeHookahServiceSelected;

                $('#existingOutletsModal').modal('show');
            }

            this.isOpenForEdit = true;
            this.indexForUpdate = index;
        },

        /**
         * Delete outlet
         */
        deleteOutlet(outlet, index) {
            if (outlet.db_status === DB_STATUS.ADD) {
                this.src.processingOutlets.splice(index, 1);
            } else {
                outlet.db_status = DB_STATUS.DELETE;
            }
            this.validateOutlets();
        },

        /**
         * Set selected outlet from dropdown
         */
        setSelectedOutlet() {
            const outlet = this.src.outlets.find(o => o.id === this.selectedOutlet.id);

            if (!outlet) return;

            this.selectedOutlet = Object.assign({}, outlet);
            this.selectedOutlet.status = 'Edit';

            // Check if facility type
            const facilityTypes = [449930004, 449930005, 449930006, 449930007,
                                  449930008, 449930009, 449930017, 449930018];
            this.isFacility = facilityTypes.includes(outlet.type);

            // Set type string
            const typeObj = this.src.outletTypes.find(t => t.Key == outlet.type);
            if (typeObj) {
                this.selectedOutlet.typestr = typeObj.Value;
            }

            this.showOptions = true;
        },

        /**
         * Check selected options
         */
        checkOptions() {
            const hasOptions = $('#open_outlet').is(':checked') ||
                              $('#close_outlet').is(':checked') ||
                              $('#change_name').is(':checked') ||
                              $('#change_location').is(':checked') ||
                              $('#change_type').is(':checked') ||
                              $('#change_hookah_service').is(':checked');

            this.isSelect_without_deleteOutlet = hasOptions;
            this.isDeleteOutlet = $('#delete_outlet').is(':checked');
            this.isOpenOutletSelected = $('#open_outlet').is(':checked');
            this.isCloseOutletSelected = $('#close_outlet').is(':checked');
        },

        /**
         * Done selecting options
         */
        doneOptions() {
            // Validate selections
            if ($('#open_outlet').is(':checked') && $('#close_outlet').is(':checked')) {
                alert('Cannot select both open and close outlet');
                return;
            }

            const hasDelete = $('#delete_outlet').is(':checked');
            const hasOther = $('#open_outlet').is(':checked') || $('#close_outlet').is(':checked') ||
                           $('#change_name').is(':checked') || $('#change_location').is(':checked') ||
                           $('#change_type').is(':checked') || $('#change_hookah_service').is(':checked');

            if (hasDelete && hasOther) {
                alert('Cannot select delete with other options');
                return;
            }

            if (!hasDelete && !hasOther) {
                alert('Please select at least one operation');
                return;
            }

            if (hasDelete) {
                this.selectDeleteRequest();
                return;
            }

            // Check for existing operations
            const checks = [
                { id: 'change_name', flag: 'isChangNameSelected', msg: 'changing name' },
                { id: 'open_outlet', flag: 'isOpenOutletSelected', msg: 'reopening' },
                { id: 'close_outlet', flag: 'isCloseOutletSelected', msg: 'closing' },
                { id: 'change_location', flag: 'isChangeLocSelected', msg: 'changing location' },
                { id: 'change_type', flag: 'isChangeTypeSelected', msg: 'changing type' },
                { id: 'change_hookah_service', flag: 'isChangeHookahServiceSelected', msg: 'changing hookah service' }
            ];

            for (let check of checks) {
                if ($(`#${check.id}`).is(':checked')) {
                    const exists = this.src.processingOutlets.some(
                        o => o[check.flag] && o.id === this.selectedOutlet.id
                    );

                    if (exists) {
                        alert(`Operation of ${check.msg} this outlet is already processing`);
                        return;
                    }

                    this[check.flag] = true;
                }
            }

            this.showOutlets = false;
            this.showOptions = false;
            this.showEditForm = true;
        },

        /**
         * Validate outlets against criteria
         */
        validateOutlets() {
            this.outletErrors = [];

            const counts = this.calculateOutletCounts();

            if (this.src.isBoutique) {
                this.validateBoutiqueHotel(counts);
            } else if (this.src.isApartmentHotel) {
                this.validateApartmentHotel(counts);
            } else {
                this.validateRegularHotel(counts);
            }
        },

        /**
         * Calculate outlet counts
         */
        calculateOutletCounts() {
            const types = [
                OUTLET_TYPES.MAIN_RESTAURANT,
                OUTLET_TYPES.CAFE,
                OUTLET_TYPES.RESTAURANT_SPECIALTY,
                OUTLET_TYPES.LOUNGE,
                OUTLET_TYPES.CLUB_LOUNGE,
                OUTLET_TYPES.FINE_DINING
            ];

            const counts = {};

            for (let type of types) {
                const existing = this.src.outlets.filter(o => o.type === type).length;
                const form = this.src.processingOutlets.filter(
                    o => o.type === type &&
                    (o.isChangeTypeSelected || o.status === "New") &&
                    o.db_status !== DB_STATUS.DELETE
                ).length;
                const deleted = this.src.processingOutlets.filter(
                    o => o.type === type && o.db_status === DB_STATUS.DELETE
                ).length;

                counts[type] = existing + form - deleted;
            }

            return counts;
        },

        /**
         * Validate boutique hotel
         */
        validateBoutiqueHotel(counts) {
            if (counts[OUTLET_TYPES.FINE_DINING] !== 1) {
                this.outletErrors.push(`Exactly 1 fine dining required, current: ${counts[OUTLET_TYPES.FINE_DINING]}`);
            }

            const sumCafes = counts[OUTLET_TYPES.MAIN_RESTAURANT] + counts[OUTLET_TYPES.CAFE];
            if (sumCafes !== 1) {
                this.outletErrors.push(`Exactly 1 all-day dining OR cafe required, current: ${sumCafes}`);
            }

            if (counts[OUTLET_TYPES.RESTAURANT_SPECIALTY] !== 1) {
                this.outletErrors.push(`Exactly 1 specialty restaurant required, current: ${counts[OUTLET_TYPES.RESTAURANT_SPECIALTY]}`);
            }
        },

        /**
         * Validate apartment hotel
         */
        validateApartmentHotel(counts) {
            if (counts[OUTLET_TYPES.MAIN_RESTAURANT] < 1) {
                this.outletErrors.push(`Minimum 1 all-day dining required, current: ${counts[OUTLET_TYPES.MAIN_RESTAURANT]}`);
            }

            if (counts[OUTLET_TYPES.CLUB_LOUNGE] > 0 || counts[OUTLET_TYPES.LOUNGE] > 0) {
                this.outletErrors.push('Lounges are not allowed in apartment hotels');
            }

            if (this.src.stars === 449930003 && counts[OUTLET_TYPES.CAFE] > 1) {
                this.outletErrors.push(`Maximum 1 cafe for 4-star, current: ${counts[OUTLET_TYPES.CAFE]}`);
            }

            if (this.src.stars === 449930004 && counts[OUTLET_TYPES.CAFE] < 1) {
                this.outletErrors.push(`Minimum 1 cafe for 5-star, current: ${counts[OUTLET_TYPES.CAFE]}`);
            }
        },

        /**
         * Validate regular hotel
         */
        validateRegularHotel(counts) {
            const stars = this.src.stars;

            // All ratings need at least 1 all-day dining
            if (counts[OUTLET_TYPES.MAIN_RESTAURANT] < 1) {
                this.outletErrors.push(`Minimum 1 all-day dining required, current: ${counts[OUTLET_TYPES.MAIN_RESTAURANT]}`);
            }

            if (stars <= 3) {
                if (counts[OUTLET_TYPES.CAFE] < 1) {
                    this.outletErrors.push(`Exactly 1 cafe required, current: ${counts[OUTLET_TYPES.CAFE]}`);
                }
            } else if (stars === 4 || stars === 5) {
                if (counts[OUTLET_TYPES.CAFE] < 1) {
                    this.outletErrors.push(`Minimum 1 cafe required, current: ${counts[OUTLET_TYPES.CAFE]}`);
                }

                if (counts[OUTLET_TYPES.RESTAURANT_SPECIALTY] < 2) {
                    this.outletErrors.push(`Minimum 2 specialty restaurants required, current: ${counts[OUTLET_TYPES.RESTAURANT_SPECIALTY]}`);
                }

                // Lounge calculations
                const roomsPerLounge = stars === 4 ? 80 : 100;
                const maxLounges = Math.floor(this.src.rooms / roomsPerLounge);

                if (counts[OUTLET_TYPES.CLUB_LOUNGE] > maxLounges) {
                    this.outletErrors.push(`Maximum ${maxLounges} club lounges allowed (1 per ${roomsPerLounge} rooms), current: ${counts[OUTLET_TYPES.CLUB_LOUNGE]}`);
                }

                if (counts[OUTLET_TYPES.LOUNGE] > maxLounges) {
                    this.outletErrors.push(`Maximum ${maxLounges} lounges allowed (1 per ${roomsPerLounge} rooms), current: ${counts[OUTLET_TYPES.LOUNGE]}`);
                }
            }
        },

        /**
         * Get leasing office by CR
         */
        async getLeasingOfficeByCR() {
            this.resetLeasingOffice();

            const cr = $('#leasing_office_cr').val();
            if (!cr) return;

            const url = `/api/EditOutletA/getOfficeByCR?cr=${cr}`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.message === "OK") {
                    this.leased_office_name = data.Office_name;
                    this.leased_office_Id = data.Office_Id;
                }
                this.leased_office_API_message = data.message;
            } catch (error) {
                console.error('Error fetching office:', error);
                this.leased_office_API_message = 'Error fetching office';
            }
        },

        /**
         * Reset leasing office
         */
        resetLeasingOffice() {
            this.leased_office_name = '';
            this.leased_office_Id = '';
            this.leased_office_API_message = '';
        },

        /**
         * Clear attachments
         */
        clearAttachments() {
            $('#att_leasing, #att_1, #att_2, #att_3, #att_4').val('');
        },

        /**
         * Toggle Ramadan Tent fields
         */
        toggle_ramadanTentAttachments() {
            const typeObj = this.src.outletTypes.find(t => t.Key == this.newOutlet.type);
            if (typeObj) {
                this.newOutlet.typestr = typeObj.Value;
            }
        },

        /**
         * Toggle management type
         */
        toggle_outletManagementType() {
            // Handled by CSS visibility
        }
    },

    beforeMount() {
        this.validateOutlets();
    }
});

// Helper functions
function toggle_outletManagementType(element) {
    const value = $(element).val();
    if (value == MANAGEMENT_TYPES.OUTSOURCED) {
        $('.cardLeasing').show();
    } else {
        $('.cardLeasing').hide();
    }
}

function toggle_ramadanTentAttachments(element) {
    const value = $(element).val();
    if (value == OUTLET_TYPES.RAMADAN_TENT) {
        $('#cardRamadanFields').show();
    } else {
        $('#cardRamadanFields').hide();
    }

    vue.toggle_ramadanTentAttachments();
}

// Form validation
function masterValidate() {
    if (vue.src.processingOutlets.length === 0) {
        alert('At least one outlet is required to submit');
        return false;
    }

    // Check for missing Ramadan Tent attachments
    const missingAttachments = vue.src.processingOutlets.some(outlet => {
        if (outlet.type == OUTLET_TYPES.RAMADAN_TENT &&
            (outlet.app_status == 449930005 || outlet.app_status == 449930008)) {
            return !outlet.att_1 || !outlet.att_2 || !outlet.att_3 || !outlet.att_4;
        }
        return false;
    });

    if (missingAttachments) {
        alert('Please upload all required Ramadan Tent documents');
        return false;
    }

    $('#submission_button').text('Submitting...').prop('disabled', true);
    return true;
}

// File validation
function validateAttachments() {
    const validExt = '.pdf';
    const maxSize = 10 * 1024 * 1024; // 10MB

    let isValid = true;

    $('input[type="file"]').each(function() {
        if (this.files[0]) {
            const file = this.files[0];
            const fileName = file.name.toLowerCase();

            // Check size
            if (file.size > maxSize) {
                alert('File size must be less than 10MB');
                isValid = false;
                return false;
            }

            // Check extension
            if (!fileName.endsWith(validExt)) {
                alert(`File must be ${validExt} format`);
                isValid = false;
                return false;
            }
        }
    });

    $('#submission_button, #updateChangesButton').prop('disabled', !isValid);
}
